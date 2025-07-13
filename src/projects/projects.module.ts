import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectsQueryController } from './projects-query.controller';
import { ProjectsCommandController } from './projects-command.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ProjectUtils } from './utils';

// Command Handlers
import {
  CreateProjectHandler,
  UpdateProjectHandler,
  UpdateProjectStatusHandler,
  DeleteProjectHandler,
  JoinProjectHandler,
  ReviewApplicationHandler,
} from './commands';

// Query Handlers
import {
  FindAllProjectsHandler,
  FindBySlugHandler,
  GetMyProjectsHandler,
  GetMyApplicationsHandler,
  GetProjectApplicationsHandler,
  GetProjectMembersHandler,
  GetProjectBasicInfoHandler,
} from './queries';

const CommandHandlers = [
  CreateProjectHandler,
  UpdateProjectHandler,
  UpdateProjectStatusHandler,
  DeleteProjectHandler,
  JoinProjectHandler,
  ReviewApplicationHandler,
];

const QueryHandlers = [
  FindAllProjectsHandler,
  FindBySlugHandler,
  GetMyProjectsHandler,
  GetMyApplicationsHandler,
  GetProjectApplicationsHandler,
  GetProjectMembersHandler,
  GetProjectBasicInfoHandler,
];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [ProjectsQueryController, ProjectsCommandController],
  providers: [...CommandHandlers, ...QueryHandlers, ProjectUtils],
})
export class ProjectsModule {}
