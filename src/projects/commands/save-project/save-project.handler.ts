import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SaveProjectCommand } from './save-project.command';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(SaveProjectCommand)
export class SaveProjectHandler implements ICommandHandler<SaveProjectCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SaveProjectCommand): Promise<{
    id: string;
    userSlug: string;
    projectSlug: string;
    savedAt: Date;
  }> {
    const { projectSlug, userSlug } = command;

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { username: userSlug },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if project is already saved by this user
    const existingSave = await this.prisma.projectSaved.findUnique({
      where: {
        userSlug_projectSlug: {
          userSlug,
          projectSlug,
        },
      },
    });

    if (existingSave) {
      throw new ConflictException('Project is already saved by this user');
    }

    try {
      // Save the project for the user
      const savedProject = await this.prisma.projectSaved.create({
        data: {
          projectSlug,
          userSlug,
        },
      });

      return {
        id: savedProject.id,
        userSlug: savedProject.userSlug,
        projectSlug: savedProject.projectSlug,
        savedAt: savedProject.savedAt,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Project is already saved by this user');
        }
        throw new BadRequestException(
          'Failed to save project: ' + error.message,
        );
      }
      throw error;
    }
  }
}
