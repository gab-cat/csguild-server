import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ReactivateProjectMemberCommand } from './reactivate-project-member.command';
import { MemberStatus } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(ReactivateProjectMemberCommand)
export class ReactivateProjectMemberHandler
  implements ICommandHandler<ReactivateProjectMemberCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReactivateProjectMemberCommand): Promise<void> {
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
        'Only the project owner can reactivate project members',
      );
    }

    // Check if the member exists and is removed
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        projectSlug,
        userSlug: memberUserSlug,
        status: MemberStatus.REMOVED,
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
        `Removed member with username '${memberUserSlug}' not found in project '${projectSlug}'`,
      );
    }

    // Check if there's space for the member in their role
    const roleSlug = projectMember.projectRole.role.slug;
    const maxMembers = projectMember.projectRole.maxMembers;

    if (maxMembers) {
      const currentActiveMembers = await this.prisma.projectMember.count({
        where: {
          projectSlug,
          roleSlug,
          status: MemberStatus.ACTIVE,
        },
      });

      if (currentActiveMembers >= maxMembers) {
        throw new BadRequestException(
          `Cannot reactivate member: Role '${roleSlug}' is at maximum capacity (${maxMembers} members)`,
        );
      }
    }

    // Update member status to ACTIVE
    await this.prisma.projectMember.update({
      where: {
        id: projectMember.id,
      },
      data: {
        status: MemberStatus.ACTIVE,
        updatedAt: new Date(),
      },
    });
  }
}
