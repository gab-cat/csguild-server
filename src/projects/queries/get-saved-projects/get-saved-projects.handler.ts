import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetSavedProjectsQuery } from './get-saved-projects.query';
import { ProjectListResponse } from '../../types/project.types';

@Injectable()
@QueryHandler(GetSavedProjectsQuery)
export class GetSavedProjectsHandler
  implements IQueryHandler<GetSavedProjectsQuery> {
  constructor(private readonly prisma: PrismaService) { }

  async execute(query: GetSavedProjectsQuery): Promise<ProjectListResponse> {
    const { userSlug, pagination } = query;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Get total count of saved projects
    const total = await this.prisma.projectSaved.count({
      where: {
        userSlug,
      },
    });

    // Get saved projects for the user with pagination
    const savedProjects = await this.prisma.projectSaved.findMany({
      where: {
        userSlug,
      },
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
      skip,
      take,
      orderBy: sortBy === 'createdAt'
        ? { savedAt: sortOrder } // For saved projects, use savedAt instead of createdAt
        : { project: { [sortBy]: sortOrder } },
    });

    // Transform to ProjectSummary format
    const data = savedProjects.map((savedProject) => {
      const project = savedProject.project;
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

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }
}
