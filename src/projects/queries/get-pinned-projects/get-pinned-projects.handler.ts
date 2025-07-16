import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetPinnedProjectsQuery } from './get-pinned-projects.query';
import { ProjectListResponse } from '../../types/project.types';

@Injectable()
@QueryHandler(GetPinnedProjectsQuery)
export class GetPinnedProjectsHandler
  implements IQueryHandler<GetPinnedProjectsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<ProjectListResponse> {
    // Get pinned projects ordered by the order field
    const pinnedProjects = await this.prisma.projectPinned.findMany({
      include: {
        project: {
          include: {
            owner: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                email: true,
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
        },
      },
      orderBy: {
        order: 'asc', // Order by the order field (1-6)
      },
    });

    // Transform to ProjectSummary format
    const projects = pinnedProjects.map((pinnedProject) => {
      const project = pinnedProject.project;
      return {
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        tags: project.tags,
        dueDate: project.dueDate,
        status: project.status,
        createdAt: project.createdAt,
        owner: {
          username: project.owner.username,
          firstName: project.owner.firstName || '',
          lastName: project.owner.lastName || '',
          imageUrl: project.owner.imageUrl || '',
        },
        roles: project.roles.map((projectRole) => ({
          roleSlug: projectRole.roleSlug,
          role: projectRole.role,
          maxMembers: projectRole.maxMembers,
          requirements: projectRole.requirements || '',
          currentMembers: projectRole._count.members,
        })),
        memberCount: project._count.members,
        applicationCount: project._count.applications,
      };
    });

    return {
      data: projects,
      pagination: {
        total: projects.length,
        page: 1,
        limit: projects.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}
