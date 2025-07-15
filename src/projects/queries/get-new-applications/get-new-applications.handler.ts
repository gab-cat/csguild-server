import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetNewApplicationsQuery } from './get-new-applications.query';

export interface ApplicationsByOwner {
  owner: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  projects: {
    project: {
      title: string;
      slug: string;
    };
    applications: {
      user: {
        firstName?: string;
        lastName?: string;
        email: string;
      };
      projectRole: {
        role: {
          name: string;
        };
      };
      message?: string;
      appliedAt: Date;
    }[];
  }[];
}

@Injectable()
@QueryHandler(GetNewApplicationsQuery)
export class GetNewApplicationsHandler
  implements IQueryHandler<GetNewApplicationsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetNewApplicationsQuery,
  ): Promise<ApplicationsByOwner[]> {
    const { startTime, endTime } = query;

    // Get all new applications within the time window
    const newApplications = await this.prisma.projectApplication.findMany({
      where: {
        appliedAt: {
          gte: startTime,
          lt: endTime,
        },
        status: 'PENDING', // Only get pending applications
      },
      include: {
        project: {
          include: {
            owner: true,
          },
        },
        user: true,
        projectRole: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    if (newApplications.length === 0) {
      return [];
    }

    // Group applications by project owner
    const applicationsByOwnerMap = new Map<
      string,
      {
        owner: any;
        projects: Map<
          string,
          {
            project: any;
            applications: any[];
          }
        >;
      }
    >();

    for (const application of newApplications) {
      const ownerEmail = application.project.owner.email;

      if (!applicationsByOwnerMap.has(ownerEmail)) {
        applicationsByOwnerMap.set(ownerEmail, {
          owner: application.project.owner,
          projects: new Map(),
        });
      }

      const ownerData = applicationsByOwnerMap.get(ownerEmail)!;
      const projectSlug = application.project.slug;

      if (!ownerData.projects.has(projectSlug)) {
        ownerData.projects.set(projectSlug, {
          project: application.project,
          applications: [],
        });
      }

      ownerData.projects.get(projectSlug)!.applications.push(application);
    }

    // Convert Map to array format expected by the interface
    return Array.from(applicationsByOwnerMap.values()).map((ownerData) => ({
      owner: {
        email: ownerData.owner.email,
        firstName: ownerData.owner.firstName,
        lastName: ownerData.owner.lastName,
      },
      projects: Array.from(ownerData.projects.values()).map((projectData) => ({
        project: {
          title: projectData.project.title,
          slug: projectData.project.slug,
        },
        applications: projectData.applications.map((app) => ({
          user: {
            firstName: app.user.firstName,
            lastName: app.user.lastName,
            email: app.user.email,
          },
          projectRole: {
            role: {
              name: app.projectRole.role.name,
            },
          },
          message: app.message,
          appliedAt: app.appliedAt,
        })),
      })),
    }));
  }
}
