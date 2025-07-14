import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RemoveProjectMemberCommand } from './remove-project-member.command';
import { MemberStatus, ApplicationStatus } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(RemoveProjectMemberCommand)
export class RemoveProjectMemberHandler
  implements ICommandHandler<RemoveProjectMemberCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RemoveProjectMemberCommand): Promise<void> {
    const { projectSlug, memberUserSlug, requestorUserSlug } = command;

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
      select: {
        id: true,
        slug: true,
        title: true,
        ownerSlug: true,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with slug '${projectSlug}' not found`,
      );
    }

    // Check if the requestor is the project owner
    if (project.ownerSlug !== requestorUserSlug) {
      throw new ForbiddenException(
        'Only the project owner can remove project members',
      );
    }

    // Check if the member exists and is active
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectSlug,
        userSlug: memberUserSlug,
        status: MemberStatus.ACTIVE,
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        projectRole: {
          include: {
            role: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!projectMember) {
      throw new NotFoundException(
        `Active member with username '${memberUserSlug}' not found in project '${projectSlug}'`,
      );
    }

    // Prevent owner from removing themselves
    if (memberUserSlug === requestorUserSlug) {
      throw new BadRequestException(
        'Project owner cannot remove themselves from the project',
      );
    }

    // Update member status to REMOVED and handle pending applications in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update member status to REMOVED instead of deleting the record
      // This preserves the history and allows for potential re-activation
      await tx.projectMember.update({
        where: {
          id: projectMember.id,
        },
        data: {
          status: MemberStatus.REMOVED,
          updatedAt: new Date(),
        },
      });

      // Cancel any pending applications for this user in the same project
      // This ensures they don't have pending applications while being removed
      await tx.projectApplication.updateMany({
        where: {
          projectSlug,
          userSlug: memberUserSlug,
          status: ApplicationStatus.PENDING,
        },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedBySlug: requestorUserSlug,
          reviewMessage:
            'Application cancelled due to member removal from project',
          updatedAt: new Date(),
        },
      });
    });
  }
}
