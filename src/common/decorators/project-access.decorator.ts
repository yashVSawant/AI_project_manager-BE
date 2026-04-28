import { applyDecorators, UseGuards } from '@nestjs/common';
import { RequireRole } from './require-role.decorator';
import { ProjectRoleGuard } from '../guards/project-role.guard';
import { ProjectRole } from '../../../generated/prisma/enums';

export function ProjectAccess(...roles: ProjectRole[]) {
  return applyDecorators(
    RequireRole(...roles),
    UseGuards(ProjectRoleGuard),
  );
}