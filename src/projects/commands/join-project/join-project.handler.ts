import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JoinProjectCommand } from './join-project.command';
import { ProjectStatus, ApplicationStatus } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(JoinProjectCommand)
export class JoinProjectHandler implements ICommandHandler<JoinProjectCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: JoinProjectCommand) {
    const { joinProjectDto, userId } = command;
    const { projectId, projectRoleId, message } = joinProjectDto;

    // Check if project exists and is open
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        roles: {
          where: { id: projectRoleId },
          include: {
            members: true,
            applications: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new BadRequestException(
        'This project is not accepting new applications',
      );
    }

    const projectRole = project.roles[0];
    if (!projectRole) {
      throw new NotFoundException(
        `Project role with ID ${projectRoleId} not found`,
      );
    }

    // Check if user already applied
    if (projectRole.applications.length > 0) {
      throw new ConflictException('You have already applied for this role');
    }

    // Check if user is already a member
    const existingMember = projectRole.members.find(
      (member) => member.userId === userId,
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
    const application = await this.prisma.projectApplication.create({
      data: {
        projectId,
        userId,
        projectRoleId,
        message,
        status: ApplicationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        projectRole: {
          include: {
            role: true,
          },
        },
      },
    });

    return application;
  }
}
