import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '../../../generated/prisma/enums';

export const REQUIRE_ROLE_KEY = 'require_role';

export const RequireRole = (...roles: ProjectRole[]) =>
  SetMetadata(REQUIRE_ROLE_KEY, roles);