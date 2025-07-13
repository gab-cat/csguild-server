import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JoinProjectCommand } from './join-project.command';
import {
  ProjectStatus,
  ApplicationStatus,
  ProjectApplication,
} from '../../../../generated/prisma';

@Injectable()
@CommandHandler(JoinProjectCommand)
export class JoinProjectHandler implements ICommandHandler<JoinProjectCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: JoinProjectCommand): Promise<ProjectApplication> {
    const { joinProjectDto, userSlug } = command;
    const { projectSlug, roleSlug, message } = joinProjectDto;

    // Check if project exists and is open
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      include: {
        roles: {
          where: {
            projectSlug: projectSlug,
            roleSlug: roleSlug,
          },
          include: {
            members: true,
            applications: {
              where: { userSlug },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with slug ${projectSlug} not found`);
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException(
        'This project is not accepting new applications',
      );
    }

    const projectRole = project.roles[0];
    if (!projectRole) {
      throw new NotFoundException(
        `Project role with slug ${roleSlug} not found`,
      );
    }

    // Check if user already applied
    if (projectRole.applications.length > 0) {
      throw new ConflictException('You have already applied for this role');
    }

    // Check if user is already a member
    const existingMember = projectRole.members.find(
      (member) => member.userSlug === userSlug,
    );
    if (existingMember) {
      throw new ConflictException(
        'You are already a member of this project role',
      );
    }

    // Check if role is full
    if (
      projectRole.maxMembers &&
      projectRole.members.length >= projectRole.maxMembers
    ) {
      throw new BadRequestException('This role is already full');
    }

    // Create application
    return this.prisma.projectApplication.create({
      data: {
        projectSlug,
        userSlug,
        roleSlug,
        message,
        status: ApplicationStatus.PENDING,
      },
    });
  }
}
