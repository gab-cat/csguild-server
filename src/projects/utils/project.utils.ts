import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectWithOwner } from '../types/project.types';

@Injectable()
export class ProjectUtils {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Standard project include structure for detailed project queries
   */
  static getProjectIncludeStructure() {
    return {
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
          role: true,
          members: {
            include: {
              user: {
                select: {
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                  email: true,
                },
              },
            },
          },
          applications: {
            include: {
              user: {
                select: {
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                  email: true,
                },
              },
              reviewer: {
                select: {
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                  email: true,
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
      members: {
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              email: true,
            },
          },
          projectRole: {
            include: {
              role: true,
            },
          },
        },
      },
      applications: {
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              email: true,
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
              imageUrl: true,
              email: true,
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
    };
  }

  /**
   * Get project with full details using the standard include structure
   */
  async getProjectWithDetails(slug: string): Promise<ProjectWithOwner | null> {
    const project = await this.prisma.project.findUnique({
      where: { slug },
      include: ProjectUtils.getProjectIncludeStructure(),
    });

    if (!project) {
      return null;
    }

    // Transform the data to match ProjectWithOwner structure
    const transformedProject: ProjectWithOwner = {
      ...project,
      owner: {
        username: project.owner.username,
        firstName: project.owner.firstName || '',
        lastName: project.owner.lastName || '',
        imageUrl: project.owner.imageUrl || undefined,
        email: project.owner.email || undefined,
      },
      roles: project.roles.map((role) => ({
        ...role,
        members: role.members.map((member) => ({
          ...member,
          user: {
            username: member.user.username,
            firstName: member.user.firstName || '',
            lastName: member.user.lastName || '',
            imageUrl: member.user.imageUrl || undefined,
          },
          projectRole: {
            roleSlug: role.roleSlug,
            role: {
              name: role.role.name,
              slug: role.role.slug,
            },
          },
        })),
        applications: role.applications.map((application) => ({
          ...application,
          user: {
            username: application.user.username,
            firstName: application.user.firstName || '',
            lastName: application.user.lastName || '',
            imageUrl: application.user.imageUrl || undefined,
          },
          projectRole: {
            roleSlug: role.roleSlug,
            role: {
              name: role.role.name,
              slug: role.role.slug,
            },
          },
          reviewer: application.reviewer
            ? {
                username: application.reviewer.username,
                firstName: application.reviewer.firstName || '',
                lastName: application.reviewer.lastName || '',
              }
            : undefined,
        })),
      })),
    };

    return transformedProject;
  }

  /**
   * Validate that all provided role slugs exist in the database
   */
  async validateRoleSlugs(roleSlugs: string[]): Promise<void> {
    const existingRoles = await this.prisma.userRole.findMany({
      where: { slug: { in: roleSlugs } },
    });

    if (existingRoles.length !== roleSlugs.length) {
      const foundRoleSlugs = existingRoles.map((role) => role.slug);
      const missingRoleSlugs = roleSlugs.filter(
        (slug) => !foundRoleSlugs.includes(slug),
      );
      throw new BadRequestException(
        `The following role slugs do not exist: ${missingRoleSlugs.join(', ')}`,
      );
    }
  }

  /**
   * Basic user select structure for consistent user data selection
   */
  static getUserSelectStructure() {
    return {
      username: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
    };
  }
}
