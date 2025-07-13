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

    // Validate project ownership
    await this.validateProjectOwnership(id, userId);

    const { roles, ...projectData } = updateProjectDto;

    try {
      const updatedProject = await this.performProjectUpdate(
        id,
        projectData,
        roles,
      );

      return await this.getUpdatedProjectDetails(updatedProject.id);
    } catch (error) {
      return this.handleUpdateError(error);
    }
  }

  /**
   * Validates that the project exists and the user is authorized to update it
   * @param projectId - ID of the project to validate
   * @param userId - ID of the user requesting the update
   */
  private async validateProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const existingProject = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (existingProject.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }
  }

  /**
   * Performs the actual project update within a transaction
   * @param projectId - ID of the project to update
   * @param projectData - Basic project data to update
   * @param roles - Optional roles data to update
   */
  private async performProjectUpdate(
    projectId: string,
    projectData: any,
    roles?: Array<{
      roleId: string;
      maxMembers?: number;
      requirements?: string;
    }>,
  ): Promise<{ id: string }> {
    return await this.prisma.$transaction(async (tx) => {
      // Update project basic info
      const project = await tx.project.update({
        where: { id: projectId },
        data: {
          ...projectData,
          dueDate: projectData.dueDate
            ? new Date(projectData.dueDate)
            : undefined,
        },
      });

      // Handle role updates if provided
      if (roles && roles.length > 0) {
        await this.updateProjectRoles(tx, projectId, roles);
      }

      return project;
    });
  }

  /**
   * Retrieves the updated project with full details
   * @param projectId - ID of the project to retrieve
   */
  private async getUpdatedProjectDetails(
    projectId: string,
  ): Promise<ProjectWithOwner> {
    const projectWithDetails =
      await this.projectUtils.getProjectWithDetails(projectId);

    if (!projectWithDetails) {
      throw new BadRequestException(
        'Failed to retrieve updated project details',
      );
    }

    return projectWithDetails;
  }

  /**
   * Handles errors that occur during project update
   * @param error - The error to handle
   */
  private handleUpdateError(error: any): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new BadRequestException(
        'Failed to update project: ' + error.message,
      );
    }
    throw error;
  }

  /**
   * Handles the differential update of project roles
   * @param tx - Prisma transaction client
   * @param projectId - ID of the project to update
   * @param roles - Array of role data to update
   */
  private async updateProjectRoles(
    tx: Prisma.TransactionClient,
    projectId: string,
    roles: Array<{
      roleId: string;
      maxMembers?: number;
      requirements?: string;
    }>,
  ): Promise<void> {
    // Validate role IDs using utility function
    const roleIds = roles.map((role) => role.roleId);
    await this.projectUtils.validateRoleIds(roleIds);

    // Get existing project roles
    const existingRoles = await this.getExistingProjectRoles(tx, projectId);

    // Calculate differential changes
    const { rolesToUpdate, rolesToCreate, roleIdsToDelete } =
      this.calculateRoleDifferences(existingRoles, roles, projectId);

    // Execute differential operations
    await this.executeRoleOperations(
      tx,
      rolesToUpdate,
      rolesToCreate,
      roleIdsToDelete,
    );
  }

  /**
   * Retrieves existing project roles from the database
   * @param tx - Prisma transaction client
   * @param projectId - ID of the project
   */
  private async getExistingProjectRoles(
    tx: Prisma.TransactionClient,
    projectId: string,
  ) {
    return await tx.projectRole.findMany({
      where: { projectId },
      select: {
        id: true,
        roleId: true,
        maxMembers: true,
        requirements: true,
      },
    });
  }

  /**
   * Calculates what roles need to be created, updated, or deleted
   * @param existingRoles - Current roles in the database
   * @param newRoles - New roles from the request
   * @param projectId - ID of the project
   */
  private calculateRoleDifferences(
    existingRoles: Array<{
      id: string;
      roleId: string;
      maxMembers: number;
      requirements: string | null;
    }>,
    newRoles: Array<{
      roleId: string;
      maxMembers?: number;
      requirements?: string;
    }>,
    projectId: string,
  ) {
    // Create maps for efficient comparison
    const existingRoleMap = new Map(
      existingRoles.map((role) => [role.roleId, role]),
    );
    const newRoleMap = new Map(newRoles.map((role) => [role.roleId, role]));

    const rolesToUpdate = [];
    const rolesToCreate = [];
    const roleIdsToDelete = [];

    // Check for updates and new roles
    for (const newRole of newRoles) {
      const existingRole = existingRoleMap.get(newRole.roleId);

      if (existingRole) {
        // Apply consistent default values for comparison and operations
        const normalizedMaxMembers = newRole.maxMembers || 1;
        const normalizedRequirements = newRole.requirements || null;

        // Check if role needs updating
        const hasChanges =
          existingRole.maxMembers !== normalizedMaxMembers ||
          existingRole.requirements !== normalizedRequirements;

        if (hasChanges) {
          rolesToUpdate.push({
            id: existingRole.id,
            data: {
              maxMembers: normalizedMaxMembers,
              requirements: normalizedRequirements,
            },
          });
        }
      } else {
        // New role to create - apply consistent default values
        rolesToCreate.push({
          projectId,
          roleId: newRole.roleId,
          maxMembers: newRole.maxMembers || 1,
          requirements: newRole.requirements || null,
        });
      }
    }

    // Check for roles to delete
    for (const existingRole of existingRoles) {
      if (!newRoleMap.has(existingRole.roleId)) {
        roleIdsToDelete.push(existingRole.id);
      }
    }

    return { rolesToUpdate, rolesToCreate, roleIdsToDelete };
  }

  /**
   * Executes the role database operations (create, update, delete)
   * @param tx - Prisma transaction client
   * @param rolesToUpdate - Roles that need to be updated
   * @param rolesToCreate - Roles that need to be created
   * @param roleIdsToDelete - Role IDs that need to be deleted
   */
  private async executeRoleOperations(
    tx: Prisma.TransactionClient,
    rolesToUpdate: Array<{ id: string; data: any }>,
    rolesToCreate: Array<any>,
    roleIdsToDelete: Array<string>,
  ): Promise<void> {
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
}
