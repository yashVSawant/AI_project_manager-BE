import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { GenerateProjectDto } from './dto/generateProject.dto';
import { ProjectService } from './project.service';
import { ProjectAccess } from '../../common/decorators/project-access.decorator';
import { EditCompontent } from './dto/project.dto';
import { ComponentDto } from './component.dto';
import { ComponentConditionDto, conditionDto } from './dto/condition.dto';
import { ConditionAction } from '../../../generated/prisma/enums';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateProjectDto, @Req() req:any) {
    return this.projectService.generateProject(dto.promt, req.user.userId);
  }

  @Get(':id')
  async getProject(@Param('id') id: string) {
    if (!id) throw new BadRequestException('id is required!');
    return this.projectService.getProject(id);
  }

  @Get()
  async getProjects(@Req() req: any) {
    return this.projectService.getProjects(req.user.userId);
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId:string){
    return this.projectService.deleteProject(projectId )
  }

  @Get('component/:componentId')
  async getComponent(@Param('componentId') componentId:string){
    return this.projectService.getComponent(componentId)
  }
  
  @ProjectAccess('ADMIN', 'EDITOR')
  @Delete('component/:componentId')
  async deleteComponent(@Param('componentId') componentId:string){
    return this.projectService.deleteComponent(componentId)
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Patch('description/:componentId')
  async editDescription(@Param('componentId') componentId:string , @Body('description') description:string){
    return this.projectService.updateDescription(componentId , description)
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Delete('description/:componentId')
  async deleteDescription(@Param('componentId') componentId:string){
    return this.projectService.deleteDescription(componentId)
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Patch('description/:componentId')
  async editRules(@Param('componentId') componentId:string , @Body('rule') rule:string){
    return this.projectService.updateRules(componentId , rule)
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Delete('description/:componentId')
  async deleteRules(@Param('componentId') componentId:string){
    return this.projectService.deleteRules(componentId)
  }

  @ProjectAccess('ADMIN', 'EDITOR')
  @Post('generate/:componentId')
  async editProjectComponent(@Body() body:EditCompontent){
    return this.projectService.editProjectComponent(body.promt,body.componentId, body.componentTree)
  }

  @ProjectAccess('ADMIN','EDITOR')
  @Post(':projectId/:componentId')
  async updateComponents(@Body() body :{components:ComponentDto[] , conditions:conditionDto[] ,componentConditions:ComponentConditionDto[]} , @Param('componentId') componentId:string , @Req() req:any ){
    return this.projectService.updateComponents(body ,componentId ,req.user.userId)
  }

  @ProjectAccess('ADMIN','EDITOR')
  @Post(':projectId/:componentId/manual')
  async updateComponentManually(@Body() body :ComponentDto  , @Param('componentId') componentId:string ){
    return this.projectService.updateComponentManually(body ,componentId )
  }

  @ProjectAccess('ADMIN','EDITOR')
  @Post(':projectId/:componentId/condition')
  async updateOrAddComponetConditions(@Body() body :{condition:conditionDto ,action:ConditionAction } , @Param('componentId') componentId:string  ){
    return this.projectService.updateOrAddComponetConditions(body.condition, body.action ,componentId)
  }
}
