import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateProjectCommand } from './update-project.command';
import { ProjectEntity } from '../../types/project.types';
import { ProjectUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<ProjectEntity> {
    const { id, updateProjectDto, userId } = command;

    // Check if project exists and user is owner
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (existingProject.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }

    const { roles, ...projectData } = updateProjectDto;

    try {
      const updatedProject = await this.prisma.$transaction(async (tx) => {
        // Update project basic info
        const project = await tx.project.update({
          where: { id },
          data: {
            ...projectData,
            dueDate: projectData.dueDate
              ? new Date(projectData.dueDate)
              : undefined,
          },
        });

        // If roles are provided, update them
        if (roles && roles.length > 0) {
          // Validate role IDs using utility function
          const roleIds = roles.map((role) => role.roleId);
          await this.projectUtils.validateRoleIds(roleIds);

          // Remove existing roles and create new ones
          await tx.projectRole.deleteMany({
            where: { projectId: id },
          });

          await tx.projectRole.createMany({
            data: roles.map((role) => ({
              projectId: id,
              roleId: role.roleId,
              maxMembers: role.maxMembers,
              requirements: role.requirements,
            })),
          });
        }

        return project;
      });

      return this.projectUtils.getProjectWithDetails(updatedProject.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to update project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
