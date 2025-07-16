import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UnsaveProjectCommand } from './unsave-project.command';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UnsaveProjectCommand)
export class UnsaveProjectHandler
  implements ICommandHandler<UnsaveProjectCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UnsaveProjectCommand): Promise<void> {
    const { projectSlug, userSlug } = command;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if project is saved by this user
    const existingSave = await this.prisma.projectSaved.findUnique({
      where: {
        userSlug_projectSlug: {
          userSlug,
          projectSlug,
        },
      },
    });

    if (!existingSave) {
      throw new NotFoundException(
        'Project is not currently saved by this user',
      );
    }

    try {
      // Remove the saved project for the user
      await this.prisma.projectSaved.delete({
        where: {
          userSlug_projectSlug: {
            userSlug,
            projectSlug,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            'Project is not currently saved by this user',
          );
        }
        throw new BadRequestException(
          'Failed to unsave project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
