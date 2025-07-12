import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateProjectCommand } from './create-project.command';
import { ProjectEntity } from '../../types/project.types';
import { ProjectUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler
  implements ICommandHandler<CreateProjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(command: CreateProjectCommand): Promise<ProjectEntity> {
    const { createProjectDto, ownerId } = command;
    const { roles, ...projectData } = createProjectDto;

    // Validate that all role IDs exist using the utility function
    const roleIds = roles.map((role) => role.roleId);
    await this.projectUtils.validateRoleIds(roleIds);

    try {
      // Create project with roles in a transaction
      const project = await this.prisma.$transaction(async (tx) => {
        // Create the project
        const createdProject = await tx.project.create({
          data: {
            ...projectData,
            dueDate: projectData.dueDate ? new Date(projectData.dueDate) : null,
            ownerId,
          },
        });

        // Create project roles
        await tx.projectRole.createMany({
          data: roles.map((role) => ({
            projectId: createdProject.id,
            roleId: role.roleId,
            maxMembers: role.maxMembers,
            requirements: role.requirements,
          })),
        });

        return createdProject;
      });

      // Return project with full details using the utility function
      return this.projectUtils.getProjectWithDetails(project.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to create project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
