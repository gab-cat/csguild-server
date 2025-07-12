import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateProjectStatusCommand } from './update-project-status.command';
import { ProjectEntity } from '../../types/project.types';
import { ProjectUtils } from '../../utils';

@Injectable()
@CommandHandler(UpdateProjectStatusCommand)
export class UpdateProjectStatusHandler
  implements ICommandHandler<UpdateProjectStatusCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectUtils: ProjectUtils,
  ) {}

  async execute(command: UpdateProjectStatusCommand): Promise<ProjectEntity> {
    const { id, updateStatusDto, userId } = command;
    const { status } = updateStatusDto;

    // Check if project exists and user is owner
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (existingProject.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can update project status',
      );
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { status },
    });

    return this.projectUtils.getProjectWithDetails(updatedProject.id);
  }
}
