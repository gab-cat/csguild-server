import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateProjectStatusCommand } from './update-project-status.command';
import { Project } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UpdateProjectStatusCommand)
export class UpdateProjectStatusHandler
  implements ICommandHandler<UpdateProjectStatusCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateProjectStatusCommand): Promise<Project> {
    const { slug, updateStatusDto, userSlug } = command;
    const { status } = updateStatusDto;

    // Check if project exists and user is owner
    const existingProject = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }

    if (existingProject.ownerSlug !== userSlug) {
      throw new ForbiddenException(
        'Only the project owner can update project status',
      );
    }

    return this.prisma.project.update({
      where: { slug },
      data: { status },
    });
  }
}
