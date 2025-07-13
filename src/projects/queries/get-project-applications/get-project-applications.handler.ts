import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetProjectApplicationsQuery } from './get-project-applications.query';
import { ProjectApplication } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetProjectApplicationsQuery)
export class GetProjectApplicationsHandler
  implements IQueryHandler<GetProjectApplicationsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetProjectApplicationsQuery,
  ): Promise<ProjectApplication[]> {
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
    };

    return this.prisma.projectApplication.findMany({
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
        reviewer: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
