import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectDto } from './dto/project.dto';
import { ConditionAction, PrismaClient, Prisma as PrismaDto, ProjectRole } from '../../../generated/prisma/client';
import { ComponentDto } from './component.dto';
import { ComponentConditionDto, conditionDto } from './dto/condition.dto';
import { AiService } from '../ai/ai.service';
import { v4 as uuid } from 'uuid';
import { BadRequestError } from 'openai';
import { text } from 'node:stream/consumers';
import { buildComponentTree } from '../../core/help';

@Injectable()
export class ProjectService {
  constructor(
    private aiService: AiService,
    private prisma: PrismaService,
  ) {}

  async generateProject(promt: string, userId: string) {
    if (!userId) throw new BadRequestException('userId is required!');
    const aiData = await this.aiService.generateProject(promt);
    console.log(aiData);
    return await this.prisma.$transaction(async (tx) => {
      // ✅ 1. Create Project
      const project = await this.createProject(
        {
          name: aiData.projectName,
          description: aiData.description,
        },
        userId,
        tx,
      );

      // ✅ 2. Build ID Maps
      const componentMap = new Map<string, string>();
      const conditionMap = new Map<string, string>();

      aiData.components?.forEach((c) => {
        componentMap.set(c.id, uuid());
      });

      aiData.conditions?.forEach((c) => {
        conditionMap.set(c.id, uuid());
      });

      // ✅ 3. Insert Components
      await this.createComponents(
        aiData.components?.map((c) => ({
          ...c,
          id: componentMap.get(c.id),
          type: c.tag,
          className: c.className,
          description: c.description,
          parentId: c.parentId ? componentMap.get(c.parentId) : null,
          text: c.text,
          rules: c.rules,
          onActiveComponentId: c.onActiveComponentId,
          activeClassName: c.activeClassName,
        })),
        project.id,
        userId,
        tx,
      );

      // ✅ 4. Insert Conditions
      await this.createConditions(
        (aiData.conditions || []).map((c) => ({
          ...c,
          id: conditionMap.get(c.id),
          rule: c.rule,
        })),
        project.id,
        tx,
      );

      // ✅ 5. Insert ComponentConditions
      await this.createComponentCondition(
        (aiData.componentConditions || []).map((cc) => ({
          ...cc,
          conditionId: conditionMap.get(cc.conditionId),
          componentId: componentMap.get(cc.componentId),
          action: cc.action,
        })),
        tx,
      );

      return {
        projectId: project.id,
        message: 'Project generated successfully',
      };
    });
  }
  async createProject(
    projectDto: ProjectDto,
    userId: string,
    prisma: PrismaDto.TransactionClient = this.prisma,
  ) {
    const time = new Date();
    return await prisma.project.create({
      data: {
        name: projectDto.name,
        userId,
        description: projectDto.description,
        createdById: userId,
        createdAt: time,
        projectMember: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
    });
  }

  async createComponents(
    components: ComponentDto[],
    projectId: string,
    userId: string,
    prisma: PrismaDto.TransactionClient = this.prisma,
  ) {
    const time = new Date();

    await prisma.component.createMany({
      data: components.map((c) => ({
        id: c.id,
        type: c.type,
        text: c.text,
        className: c.className,
        description: c.description,
        parentId: c.parentId,
        projectId: projectId,
        onActiveComponentId: c.onActiveComponentId,
        activeClassName: c.activeClassName,
        createdById: userId,
        createdAt: time,
        order: c.order,
      })),
    });
  }

  async createConditions(
    conditions: conditionDto[],
    projectId: string,
    prisma: PrismaDto.TransactionClient = this.prisma,
  ) {
    await prisma.condition.createMany({
      data: conditions.map((dto) => ({
        id: dto.id,
        rule: dto.rule,
        projectId,
      })),
    });
  }

  async createComponentCondition(
    componentConditionDto: ComponentConditionDto[],
    prisma: PrismaDto.TransactionClient = this.prisma,
  ) {
    await prisma.componentCondition.createMany({
      data: componentConditionDto.map((dto) => ({
        ...dto,
      })),
    });
  }

  async getProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        components: {
          where:{deletedAt:null},
          include: {
            componentConditions: {
              include: {
                condition: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        conditions: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // ✅ Step 1: Create map
    const componentMap = new Map<string, any>();

    project.components.forEach((comp) => {
      componentMap.set(comp.id, {
        ...comp,
        id: comp.id,
        type: comp.type,
        className: comp.className,
        description: comp.description,
        parentId: comp.parentId,
        children: [],
        conditions: comp.componentConditions.map((cc) => ({
          conditionId: cc.conditionId,
          rule: cc.condition.rule,
          action: cc.action,
        })),
      });
    });

    // ✅ Step 2: Build tree
    const tree: any[] = [];

    componentMap.forEach((comp) => {
      if (comp.parentId) {
        const parent = componentMap.get(comp.parentId);
        if (parent) {
          parent.children.push(comp);
        }
      } else {
        tree.push(comp); // root
      }
    });

    // ✅ Step 3: Return structured response
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      components: tree,
    };
  }

  async getProjects(userId: string) {
  const projects = await this.prisma.project.findMany({
    where: {
      deletedAt: null,
      OR: [
        {
          projectMember: {
            some: { userId }, // shared
          },
        },
      ],
    },
    include: {
      projectMember: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  return projects.map((project)=>{
    return {
    ...project,
    projectMember :undefined,
    role:project.projectMember[0]?.role,
    }
  })
}

  async deleteProject(projectId:string ){
    return this.prisma.project.update({
      where:{
        id:projectId,
      },
      data:{
        deletedAt:new Date()
      }
    })
  }

  async deleteComponent(componentId:string ,prisma :PrismaDto.TransactionClient = this.prisma){
      const componentIds = await this.getSubtreeIds(componentId)
        await prisma.component.updateMany({
        where:{
          id:{in:componentIds}
        },
        data:{
          deletedAt: new Date()
        }
      });
  }

  async getSubtreeIds(componentId: string, ) {
    const result = await this.prisma.$queryRaw<{ id: string }[]>`
          WITH RECURSIVE subtree AS (
            SELECT id FROM component WHERE id = ${componentId}
            UNION ALL
            SELECT c.id
            FROM component c
            INNER JOIN subtree s ON c.parent_id = s.id
          )
          SELECT id FROM subtree;
        `;

    return result.map(r => r.id);
  }

    async restoreComponent(componentId: string) {
      const ids = await this.getSubtreeIds(componentId);
      await this.prisma.component.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: null },
      });
  }

  async addUserToProject(projectId:string , userEmail:string , role : ProjectRole){
    const user = await this.prisma.user.findFirstOrThrow({
      where:{
        email:userEmail
      }
    });

    await this.prisma.projectMember.create({
      data:{
        projectId,
        userId:user.id,
        role
      }
    })
  }

  async updateDescription(componentId:string , description:string){
    await this.prisma.component.update({
      where:{
        id:componentId
      },
      data:{
        description:description
      }
    })
  }

  async deleteDescription(componentId:string ){
    await this.prisma.component.update({
      where:{
        id:componentId
      },
      data:{
        description:null
      }
    })
  }

  async updateRules(componentId:string , rules:string){
    await this.prisma.component.update({
      where:{
        id:componentId
      },
      data:{
        rules
      }
    })
  }

  async deleteRules(componentId:string ){
    await this.prisma.component.update({
      where:{
        id:componentId
      },
      data:{
        rules:null
      }
    })
  }

  async editProjectComponent(
  promt: string,
  componentId: string,
  componentTree:any,
) {
  const component = await this.prisma.component.findUniqueOrThrow({
    where:{
      id:componentId
    }
  })
  const aiData = await this.aiService.editComponent(promt, componentTree);

  // ✅ ID maps
  const componentMap = new Map<string, string>();
  const conditionMap = new Map<string, string>();

  aiData.components.forEach((c) => {
    componentMap.set(c.id, uuid());
  });

  aiData.conditions?.forEach((c) => {
    conditionMap.set(c.id, uuid());
  });

  // ✅ map components
  const mappedComponents = aiData.components.map((c) => ({
    ...c,
    id: componentMap.get(c.id),
    type: c.tag,
    parentId: c.parentId ? componentMap.get(c.parentId) : component.parentId,
  }));

  // ✅ map conditions
  const mappedConditions = (aiData.conditions || []).map((c) => ({
    ...c,
    id: conditionMap.get(c.id),
  }));

  // ✅ map componentConditions
  const mappedComponentConditions = (aiData.componentConditions || []).map(
    (cc) => ({
      ...cc,
      conditionId: conditionMap.get(cc.conditionId),
      componentId: componentMap.get(cc.componentId),
    }),
  );

  // ✅ build tree (same as your getProject)
  const tree = buildComponentTree(mappedComponents, mappedComponentConditions);

  return {
    components: mappedComponents,
    conditions: mappedConditions,
    componentConditions: mappedComponentConditions,
    tree, // 🔥 important for FE preview
  };
}

async updateComponents(dto:{components:ComponentDto[] , conditions:conditionDto[] ,componentConditions:ComponentConditionDto[]} , componentId:string ,userId:string) {
    // ✅ 2. Build ID Maps
      const componentMap = new Map<string, string>();
      const conditionMap = new Map<string, string>();

      const component = await this.prisma.component.findUniqueOrThrow({
        where:{id:componentId},
        select:{
          projectId:true,
          parentId:true
        }
      })

      dto.components.forEach((c) => {
        c.id && componentMap.set(c.id, uuid());
      });

      dto.conditions?.forEach((c) => {
        c.id && conditionMap.set(c.id, uuid());
      });

      await this.prisma.$transaction(async(tx)=>{

      // ✅ 3. Insert Components
      await this.createComponents(
        dto.components.map((c) => ({
          ...c,
          id: c.id && componentMap.get(c.id),
          type: c.type,
          className: c.className,
          description: c.description,
          parentId: c.parentId ? componentMap.get(c.parentId) : component.parentId||undefined,
          text: c.text,
          rules: c.rules,
          onActiveComponentId: c.onActiveComponentId,
          activeClassName: c.activeClassName,
        })),
        component.projectId,
        userId,
        tx,
      );

      // ✅ 4. Insert Conditions
      await this.createConditions(
        (dto.conditions || []).map((c) => ({
          ...c,
          id: c.id && conditionMap.get(c.id),
          rule: c.rule,
        })),
        component.projectId,
        tx,
      );

      // ✅ 5. Insert ComponentConditions
      await this.createComponentCondition(
        (dto.componentConditions || []).map((cc) => ({
          ...cc,
          conditionId:  conditionMap.get(cc.conditionId) ||"",
          componentId:  componentMap.get(cc.componentId) ||"",
          action: cc.action,
        })),
        tx,
      );
      await this.deleteComponent(componentId , tx)
      })
  }

  async updateComponentManually(dto:ComponentDto  , componentId:string ) {
    return await this.prisma.$transaction(async(tx)=>{
      // ✅ 1. Update Component
      await this.prisma.component.update({
        where: { id: componentId },
        data: {
          ...dto,
        }
      });
    });
  }

  async updateOrAddComponetConditions(conditions:conditionDto , action:ConditionAction , componentId:string ){
    const component = await this.prisma.component.findUniqueOrThrow({
      where:{id:componentId},
      select:{
        projectId:true,
      }
    })
    await this.prisma.$transaction(async(tx)=>{
      const existing = await this.prisma.condition.upsert({
        where:{
          id:conditions.id
        },
        create:{
          ...conditions,
          projectId:component.projectId
        },
        update:{
          ...conditions,
        }
      })

      const componentCondition = await this.prisma.componentCondition.findFirst({
        where:{
          componentId,
          conditionId:existing.id
        }
      })
      if(componentCondition){
        await this.prisma.componentCondition.update({
          where:{
            id:componentCondition.id
          },
          data:{
            conditionId:existing.id,
            componentId,
            action:action,
          }
        })
      } else {
        await this.prisma.componentCondition.create({
          data:{
            conditionId:existing.id,
            componentId,
            action:action,
          }
        })
      }
      
    })
  }

  async getComponent(componentId:string){
    return await this.prisma.component.findUniqueOrThrow({
      where:{
        id:componentId
      },
      include:{
        componentConditions:{
          include:{
            condition:true
          }
        },

      }
    })
  }
}
