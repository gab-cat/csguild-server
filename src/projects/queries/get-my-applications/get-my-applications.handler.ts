import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetMyApplicationsQuery } from './get-my-applications.query';

@Injectable()
@QueryHandler(GetMyApplicationsQuery)
export class GetMyApplicationsHandler
  implements IQueryHandler<GetMyApplicationsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyApplicationsQuery) {
    const { userId } = query;

    const applications = await this.prisma.projectApplication.findMany({
      where: { userId },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        projectRole: {
          include: {
            role: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return applications;
  }
}
