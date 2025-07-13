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
    const { slug, userSlug } = command;

    // Check if project exists and user is owner
    const existingProject = await this.prisma.project.findUnique({
      where: { slug },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with slug ${slug} not found`);
    }

    if (existingProject.ownerSlug !== userSlug) {
      throw new ForbiddenException(
        'Only the project owner can delete this project',
      );
    }

    // Delete project (cascade will handle related records)
    await this.prisma.project.delete({
      where: { slug },
    });
  }
}
