import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateProjectCommand } from './create-project.command';
import { ProjectUtils } from '../../utils';
import { Prisma, Project } from '../../../../generated/prisma';
import { UtilsService } from 'src/common/utils/utils.service';

@Injectable()
@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler
  implements ICommandHandler<CreateProjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
    private readonly utilsService: UtilsService,
  ) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const { createProjectDto, ownerSlug } = command;
    const { roles, ...projectData } = createProjectDto;

    // Generate slug from title
    const slug = this.utilsService.generateSlug(projectData.title);

    // Validate that all role slugs exist using the utility function
    const roleSlugs = roles.map((role) => role.roleSlug);
    await this.projectUtils.validateRoleSlugs(roleSlugs);

    try {
      // Create project with roles in a transaction
      return await this.prisma.$transaction(async (tx) => {
        // Create the project
        const createdProject = await tx.project.create({
          data: {
            ...projectData,
            slug,
            dueDate: projectData.dueDate ? new Date(projectData.dueDate) : null,
            ownerSlug,
          },
        });

        // Create project roles
        await tx.projectRole.createMany({
          data: roles.map((role) => ({
            projectSlug: createdProject.slug,
            roleSlug: role.roleSlug,
            maxMembers: role.maxMembers,
            requirements: role.requirements,
          })),
        });

        return createdProject;
      });
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
