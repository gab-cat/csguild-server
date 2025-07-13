import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetProjectMembersQuery } from './get-project-members.query';
import { ProjectMember, MemberStatus } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetProjectMembersQuery)
export class GetProjectMembersHandler
  implements IQueryHandler<GetProjectMembersQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetProjectMembersQuery): Promise<ProjectMember[]> {
    const { projectSlug, roleSlug } = query;

    // First verify project exists
    const project = await this.prisma.project.findUnique({
      where: { slug: projectSlug },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const where = {
      projectRole: {
        projectSlug,
        ...(roleSlug && { roleSlug }),
      },
      status: MemberStatus.ACTIVE,
    };

    return this.prisma.projectMember.findMany({
      where,
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
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
      orderBy: {
        joinedAt: 'asc',
      },
    });
  }
}
