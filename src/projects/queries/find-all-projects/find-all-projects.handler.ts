import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FindAllProjectsQuery } from './find-all-projects.query';
import { ProjectListResponse } from '../../types/project.types';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(FindAllProjectsQuery)
export class FindAllProjectsHandler
  implements IQueryHandler<FindAllProjectsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: FindAllProjectsQuery): Promise<ProjectListResponse> {
    const { filters, pagination } = query;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = pagination;

    const { status, tags, search, ownerSlug, dueDate } = filters;

    // Build where clause
    const where: Prisma.ProjectWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (ownerSlug) {
      where.ownerSlug = ownerSlug;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dueDate) {
      if (dueDate.from && dueDate.to) {
        where.dueDate = {
          gte: dueDate.from,
          lte: dueDate.to,
        };
      } else if (dueDate.from) {
        where.dueDate = { gte: dueDate.from };
      } else if (dueDate.to) {
        where.dueDate = { lte: dueDate.to };
      }
    }

    // Exclude pinned projects from regular results
    // Pinned projects are queried separately when ?pinned=true is used
    where.pinnedProject = null;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = limit;

    // Get total count
    const total = await this.prisma.project.count({ where });

    // Get projects
    const projects = await this.prisma.project.findMany({
      where,
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
      skip,
      take,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Transform to summary format
    const data = projects.map((project) => ({
      ...project,
      roles: project.roles.map((projectRole) => ({
        roleSlug: projectRole.roleSlug,
        role: projectRole.role,
        maxMembers: projectRole.maxMembers,
        requirements: projectRole.requirements,
        currentMembers: projectRole._count.members,
      })),
      memberCount: project._count.members,
      applicationCount: project._count.applications,
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: data as ProjectListResponse['data'], // Type transformation handled by controller
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
