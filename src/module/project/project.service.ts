
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService  } from "../../prisma/prisma.service";
import { ProjectDto } from "./dto/project.dto";
import { Prisma as PrismaDto} from "../../../generated/prisma/client";
import { ComponentDto } from "./component.dto";
import { ComponentConditionDto, conditionDto } from "./dto/condition.dto";
import { AiService } from "../ai/ai.service";
import { v4 as uuid } from "uuid";
import { BadRequestError } from "openai";
import { text } from "node:stream/consumers";

@Injectable()
export class ProjectService {

  constructor(private aiService: AiService,private prisma: PrismaService  ) {

  }

async generateProject(input:string , userId:string){
    if(!userId) throw new BadRequestException("userId is required!")
        const aiData = await this.aiService.generateProject(input, userId);
      console.log(aiData);
return await this.prisma.$transaction(async (tx) => {
    // ✅ 1. Create Project
    const project = await this.createProject({
        name: aiData.projectName,
        description: aiData.description,
      },
    userId,tx)

    // ✅ 2. Build ID Maps
    const componentMap = new Map<string, string>();
    const conditionMap = new Map<string, string>();

    aiData.components.forEach((c) => {
      componentMap.set(c.id, uuid());
    });

    aiData.conditions?.forEach((c) => {
      conditionMap.set(c.id, uuid());
    });

    // ✅ 3. Insert Components
    await this.createComponents(aiData.components.map((c) => ({
      ...c,
        id: componentMap.get(c.id),
        type: c.tag,
        className: c.className,
        description: c.description,
        parentId: c.parentId ? componentMap.get(c.parentId) : null,
        text: c.text,
        rules:c.rules,
        onActiveComponentId:c.onActiveComponentId,
        activeClassName:c.activeClassName,
      })),project.id , userId,tx)
    

    // ✅ 4. Insert Conditions
    await this.createConditions((aiData.conditions || []).map((c) => ({
      ...c,
        id: conditionMap.get(c.id),
        rule: c.rule,
      })) ,project.id,tx)
    

    // ✅ 5. Insert ComponentConditions
    await this.createComponentCondition((aiData.componentConditions || []).map((cc) => ({
      ...cc,
        conditionId: conditionMap.get(cc.conditionId),
        componentId: componentMap.get(cc.componentId),
        action: cc.action
      })),tx)
    

    return {
      projectId: project.id,
      message: "Project generated successfully"
    };
  });
}
async createProject(projectDto:ProjectDto , userId:string ,prisma:PrismaDto.TransactionClient = this.prisma){
  const time = new Date();
  return await prisma.project.create({
    data:{
      name:projectDto.name,
      userId ,
      description:projectDto.description,
      createdById:userId,
      createdAt:time
    }
  })
}

async createComponents(
  components: ComponentDto[],
  projectId: string,
  userId: string,
  prisma:PrismaDto.TransactionClient = this.prisma
) {
  const time = new Date();

  await prisma.component.createMany({
    data: components.map((c) => ({
      id:c.id,
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
      order:c.order
    }))
  });
}

async createConditions (conditions:conditionDto [], projectId:string , prisma:PrismaDto.TransactionClient = this.prisma){
  await prisma.condition.createMany({
    data : conditions.map((dto)=>({
      id:dto.id,
    rule:dto.rule,
    projectId
    }))
  })
}

async createComponentCondition (componentConditionDto:ComponentConditionDto[] , prisma:PrismaDto.TransactionClient = this.prisma) {
  await prisma.componentCondition.createMany({
    data:componentConditionDto.map((dto)=>({
      ...dto
    }))
  })
}

async getProject(projectId: string) {
  const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    include: {
      components: {
        include: {
          componentConditions: {
            include: {
              condition: true
            }
          }
        },
        orderBy:{order:"asc"}
      },
      conditions: true
    }
  });

  if (!project) {
    throw new Error("Project not found");
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
        action: cc.action
      }))
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
    components: tree
  };
}

async getProjects(userId:string){
  return this.prisma.project.findMany({
    where:{
      userId
    }
  })
}
}