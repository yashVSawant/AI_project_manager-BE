import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE_KEY } from '../decorators/require-role.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRole } from '../../../generated/prisma/enums';

@Injectable()
export class ProjectRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<ProjectRole[]>(
      REQUIRE_ROLE_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const componentId = request.params.id;

    // 1. get projectId from component
    const component = await this.prisma.component.findUnique({
      where: { id: componentId },
      select: { projectId: true },
    });

    if (!component) throw new ForbiddenException('Component not found');

    // 2. get user role
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: component.projectId,
          userId,
        },
      },
    });

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}