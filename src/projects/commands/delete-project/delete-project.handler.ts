import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DeleteProjectCommand } from './delete-project.command';

@Injectable()
@CommandHandler(DeleteProjectCommand)
export class DeleteProjectHandler
  implements ICommandHandler<DeleteProjectCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteProjectCommand): Promise<void> {
    const { id, userId } = command;

    // Check if project exists and user is owner
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    if (existingProject.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can delete this project',
      );
    }

    // Delete project (cascade will handle related records)
    await this.prisma.project.delete({
      where: { id },
    });
  }
}
