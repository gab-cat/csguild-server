import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RolesQueryController } from './roles-query.controller';
import { RolesCommandController } from './roles-command.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { RoleUtils } from './utils';

// Command Handlers
import {
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
} from './commands';

// Query Handlers
import {
  FindAllRolesHandler,
  FindRoleByIdHandler,
  FindRoleBySlugHandler,
} from './queries';

const CommandHandlers = [
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
];

const QueryHandlers = [
  FindAllRolesHandler,
  FindRoleByIdHandler,
  FindRoleBySlugHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [RolesQueryController, RolesCommandController],
  providers: [...CommandHandlers, ...QueryHandlers, RoleUtils],
  exports: [],
})
export class RolesModule {}
