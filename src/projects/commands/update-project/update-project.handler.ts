import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateProjectCommand } from './update-project.command';
import { ProjectUtils } from '../../utils';
import { Prisma } from '../../../../generated/prisma';
import { ProjectWithOwner } from 'src/projects/types/project.types';

@Injectable()
@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<ProjectWithOwner> {
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

        // If roles are provided, perform differential update
        if (roles && roles.length > 0) {
          // Validate role IDs using utility function
          const roleIds = roles.map((role) => role.roleId);
          await this.projectUtils.validateRoleIds(roleIds);

          // Get existing project roles
          const existingRoles = await tx.projectRole.findMany({
            where: { projectId: id },
            select: {
              id: true,
              roleId: true,
              maxMembers: true,
              requirements: true,
            },
          });

          // Create maps for efficient comparison
          const existingRoleMap = new Map(
            existingRoles.map((role) => [role.roleId, role]),
          );
          const newRoleMap = new Map(roles.map((role) => [role.roleId, role]));

          // Identify roles to update, create, and delete
          const rolesToUpdate = [];
          const rolesToCreate = [];
          const roleIdsToDelete = [];

          // Check for updates and new roles
          for (const newRole of roles) {
            const existingRole = existingRoleMap.get(newRole.roleId);

            if (existingRole) {
              // Check if role needs updating
              const hasChanges =
                existingRole.maxMembers !== (newRole.maxMembers || 1) ||
                existingRole.requirements !== (newRole.requirements || null);

              if (hasChanges) {
                rolesToUpdate.push({
                  id: existingRole.id,
                  data: {
                    maxMembers: newRole.maxMembers,
                    requirements: newRole.requirements,
                  },
                });
              }
            } else {
              // New role to create
              rolesToCreate.push({
                projectId: id,
                roleId: newRole.roleId,
                maxMembers: newRole.maxMembers,
                requirements: newRole.requirements,
              });
            }
          }

          // Check for roles to delete
          for (const existingRole of existingRoles) {
            if (!newRoleMap.has(existingRole.roleId)) {
              roleIdsToDelete.push(existingRole.id);
            }
          }

          // Execute differential operations
          await Promise.all([
            // Update existing roles
            ...rolesToUpdate.map((roleUpdate) =>
              tx.projectRole.update({
                where: { id: roleUpdate.id },
                data: roleUpdate.data,
              }),
            ),
            // Create new roles
            ...(rolesToCreate.length > 0
              ? [tx.projectRole.createMany({ data: rolesToCreate })]
              : []),
            // Delete removed roles
            ...(roleIdsToDelete.length > 0
              ? [
                  tx.projectRole.deleteMany({
                    where: { id: { in: roleIdsToDelete } },
                  }),
                ]
              : []),
          ]);
        }

        return project;
      });

      const projectWithDetails = await this.projectUtils.getProjectWithDetails(
        updatedProject.id,
      );

      if (!projectWithDetails) {
        throw new BadRequestException(
          'Failed to retrieve updated project details',
        );
      }
      return projectWithDetails;
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
