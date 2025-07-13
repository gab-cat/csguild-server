import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetMyProjectsQuery } from './get-my-projects.query';
import { ProjectSummary } from '../../types/project.types';
import { MemberStatus } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetMyProjectsQuery)
export class GetMyProjectsHandler implements IQueryHandler<GetMyProjectsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyProjectsQuery): Promise<ProjectSummary[]> {
    const { userSlug } = query;

    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { ownerSlug: userSlug },
          {
            members: {
              some: {
                userSlug,
                status: MemberStatus.ACTIVE,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            applications: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return projects.map((project) => ({
      id: project.id,
      ...project,
      roles: project.roles.map((projectRole) => ({
        roleSlug: projectRole.roleSlug,
        role: projectRole.role,
        maxMembers: projectRole.maxMembers,
        requirements: projectRole.requirements || '',
        currentMembers: projectRole._count.members,
      })),
      memberCount: project._count.members,
      applicationCount: project._count.applications,
    })) as ProjectSummary[];
  }
}
