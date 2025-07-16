import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectsQueryController } from './projects-query.controller';
import { ProjectsCommandController } from './projects-command.controller';
import { ProjectsAdminController } from './projects-admin.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { EmailModule } from '../common/email/email.module';
import { LoggerModule } from '../common/logger/logger.module';
import { ProjectUtils } from './utils';

// Command Handlers
import {
  CreateProjectHandler,
  UpdateProjectHandler,
  UpdateProjectStatusHandler,
  DeleteProjectHandler,
  JoinProjectHandler,
  ReviewApplicationHandler,
  RemoveProjectMemberHandler,
  ReactivateProjectMemberHandler,
  SendApplicationNotificationHandler,
  PinProjectHandler,
  UnpinProjectHandler,
  SaveProjectHandler,
  UnsaveProjectHandler,
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
  GetNewApplicationsHandler,
  GetPinnedProjectsHandler,
  GetSavedProjectsHandler,
} from './queries';

const CommandHandlers = [
  CreateProjectHandler,
  UpdateProjectHandler,
  UpdateProjectStatusHandler,
  DeleteProjectHandler,
  JoinProjectHandler,
  ReviewApplicationHandler,
  RemoveProjectMemberHandler,
  ReactivateProjectMemberHandler,
  SendApplicationNotificationHandler,
  PinProjectHandler,
  UnpinProjectHandler,
  SaveProjectHandler,
  UnsaveProjectHandler,
];

const QueryHandlers = [
  FindAllProjectsHandler,
  FindBySlugHandler,
  GetMyProjectsHandler,
  GetMyApplicationsHandler,
  GetProjectApplicationsHandler,
  GetProjectMembersHandler,
  GetProjectBasicInfoHandler,
  GetNewApplicationsHandler,
  GetPinnedProjectsHandler,
  GetSavedProjectsHandler,
];

@Module({
  imports: [PrismaModule, EmailModule, LoggerModule, CqrsModule],
  controllers: [
    ProjectsQueryController,
    ProjectsCommandController,
    ProjectsAdminController,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ProjectUtils],
})
export class ProjectsModule {}
