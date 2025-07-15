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
import { Prisma, Project } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler
  implements ICommandHandler<UpdateProjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<Project> {
    const { slug, updateProjectDto, userSlug } = command;

    // Check if project exists and validate ownership
    const existingProject = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }

    if (existingProject.ownerSlug !== userSlug) {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }

    const { roles, ...projectData } = updateProjectDto;

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Update project basic info
        const updatedProject = await tx.project.update({
          where: { slug },
          data: {
            ...projectData,
            dueDate: projectData.dueDate
              ? new Date(projectData.dueDate)
              : undefined,
          },
        });

        // Handle role updates if provided
        if (roles && roles.length > 0) {
          // Validate role slugs
          const roleSlugs = roles.map((role) => role.roleSlug);
          await this.projectUtils.validateRoleSlugs(roleSlugs);

          // Get existing project roles
          const existingRoles = await tx.projectRole.findMany({
            where: { projectSlug: slug },
            include: {
              _count: {
                select: {
                  members: {
                    where: {
                      status: 'ACTIVE', // Only count active members
                    },
                  },
                },
              },
            },
          });

          // Create maps for easier processing
          const existingRolesMap = new Map(
            existingRoles.map((role) => [role.roleSlug, role]),
          );
          const newRolesMap = new Map(
            roles.map((role) => [role.roleSlug, role]),
          );

          // Identify roles to add, update, and remove
          const rolesToAdd = roles.filter(
            (role) => !existingRolesMap.has(role.roleSlug),
          );
          const rolesToUpdate = roles.filter((role) =>
            existingRolesMap.has(role.roleSlug),
          );
          const rolesToRemove = existingRoles.filter(
            (role) => !newRolesMap.has(role.roleSlug),
          );

          // Prevent removal of roles that have active members
          const rolesWithMembers = rolesToRemove.filter(
            (role) => role._count.members > 0,
          );
          if (rolesWithMembers.length > 0) {
            const roleNames = rolesWithMembers.map((role) => role.roleSlug);
            throw new BadRequestException(
              `Cannot remove roles that have active members: ${roleNames.join(', ')}. ` +
                'Please remove all members from these roles first, or keep the roles in your update.',
            );
          }

          // Add new roles
          if (rolesToAdd.length > 0) {
            await tx.projectRole.createMany({
              data: rolesToAdd.map((role) => ({
                projectSlug: slug,
                roleSlug: role.roleSlug,
                maxMembers: role.maxMembers || 1,
                requirements: role.requirements || null,
              })),
            });
          }

          // Update existing roles (preserve members by updating in place)
          for (const role of rolesToUpdate) {
            await tx.projectRole.updateMany({
              where: {
                projectSlug: slug,
                roleSlug: role.roleSlug,
              },
              data: {
                maxMembers: role.maxMembers || 1,
                requirements: role.requirements || null,
              },
            });
          }

          // Remove roles that don't have members (safe to delete)
          if (rolesToRemove.length > 0) {
            await tx.projectRole.deleteMany({
              where: {
                projectSlug: slug,
                roleSlug: {
                  in: rolesToRemove.map((role) => role.roleSlug),
                },
              },
            });
          }
        }

        return updatedProject;
      });
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
