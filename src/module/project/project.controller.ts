import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { GenerateProjectDto } from './dto/generateProject.dto';
import { ProjectService } from './project.service';
import { ProjectAccess } from '../../common/decorators/project-access.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateProjectDto, @Req() req) {
    return this.projectService.generateProject(dto.message, req.user.userId);
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
  async deleteProject(@Param('projectId') projectId){
    return this.projectService.deleteProject(projectId )
  }
  
  @ProjectAccess('ADMIN', 'EDITOR')
  @Delete('component/:componentId')
  async deleteComponent(@Param('componentId') componentId){
    return this.projectService.deleteComponent(componentId)
  }
}
