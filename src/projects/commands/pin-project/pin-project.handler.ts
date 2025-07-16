import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PinProjectCommand } from './pin-project.command';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(PinProjectCommand)
export class PinProjectHandler implements ICommandHandler<PinProjectCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PinProjectCommand): Promise<{
    id: string;
    projectSlug: string;
    pinnedAt: Date;
    order: number;
    pinnedBy: string;
  }> {
    const { projectSlug, adminUsername } = command;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if project is already pinned
    const existingPin = await this.prisma.projectPinned.findUnique({
      where: { projectSlug },
    });

    if (existingPin) {
      throw new ConflictException('Project is already pinned');
    }

    // Check if we've reached the maximum limit of 6 pinned projects
    const pinnedCount = await this.prisma.projectPinned.count();
    if (pinnedCount >= 6) {
      throw new UnprocessableEntityException(
        'Maximum limit of 6 pinned projects has been reached',
      );
    }

    try {
      const pinnedProject = await this.prisma.$transaction(async (tx) => {
        // Get the next order number within the transaction
        const maxOrder = await tx.projectPinned.aggregate({
          _max: { order: true },
        });
        const nextOrder = (maxOrder._max.order || 0) + 1;
        // Pin the project and return the created data
        return await tx.projectPinned.create({
          data: {
            projectSlug,
            pinnedBy: adminUsername,
            order: nextOrder,
          },
        });
      });
      return {
        id: pinnedProject.id,
        projectSlug: pinnedProject.projectSlug,
        pinnedAt: pinnedProject.pinnedAt,
        order: pinnedProject.order,
        pinnedBy: pinnedProject.pinnedBy,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Project is already pinned');
        }
        throw new BadRequestException(
          'Failed to pin project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
