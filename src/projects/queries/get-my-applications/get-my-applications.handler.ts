import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetMyApplicationsQuery } from './get-my-applications.query';
import { ProjectApplication } from 'generated/prisma/client';

@Injectable()
@QueryHandler(GetMyApplicationsQuery)
export class GetMyApplicationsHandler
  implements IQueryHandler<GetMyApplicationsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyApplicationsQuery): Promise<ProjectApplication[]> {
    const { userSlug } = query;

    const applications = await this.prisma.projectApplication.findMany({
      where: { userSlug },
      include: {
        project: {
          include: {
            owner: {
              select: {
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

    // Fetch project member data for approved applications
    const applicationsWithMembers = await Promise.all(
      applications.map(async (application) => {
        if (application.status === 'APPROVED') {
          const projectMember = await this.prisma.projectMember.findFirst({
            where: {
              projectSlug: application.projectSlug,
              userSlug: application.userSlug,
              roleSlug: application.roleSlug,
            },
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
          });

          return {
            ...application,
            projectMember,
          };
        }
        return application;
      }),
    );

    return applicationsWithMembers;
  }
}
