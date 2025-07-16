import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UnpinProjectCommand } from './unpin-project.command';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UnpinProjectCommand)
export class UnpinProjectHandler
  implements ICommandHandler<UnpinProjectCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UnpinProjectCommand): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projectSlug, adminUsername } = command;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if project is currently pinned
    const pinnedProject = await this.prisma.projectPinned.findUnique({
      where: { projectSlug },
    });

    if (!pinnedProject) {
      throw new NotFoundException('Project is not currently pinned');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Remove the pinned project
        await tx.projectPinned.delete({
          where: { projectSlug },
        });

        // Adjust the order of remaining pinned projects
        // Move all projects with higher order numbers down by 1
        await tx.projectPinned.updateMany({
          where: {
            order: {
              gt: pinnedProject.order,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to unpin project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
