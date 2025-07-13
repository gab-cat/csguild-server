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

          // Delete existing roles and create new ones (simpler approach)
          await tx.projectRole.deleteMany({
            where: { projectSlug: slug },
          });

          await tx.projectRole.createMany({
            data: roles.map((role) => ({
              projectSlug: slug,
              roleSlug: role.roleSlug,
              maxMembers: role.maxMembers || 1,
              requirements: role.requirements || null,
            })),
          });
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
