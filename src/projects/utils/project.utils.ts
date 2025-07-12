import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProjectEntity } from '../types/project.types';

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
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      roles: {
        include: {
          role: true,
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
            },
          },
          applications: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
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
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
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
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
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
  async getProjectWithDetails(id: string): Promise<ProjectEntity> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: ProjectUtils.getProjectIncludeStructure(),
    });

    return project as any;
  }

  /**
   * Validate that all provided role IDs exist in the database
   */
  async validateRoleIds(roleIds: string[]): Promise<void> {
    const existingRoles = await this.prisma.userRole.findMany({
      where: { id: { in: roleIds } },
    });

    if (existingRoles.length !== roleIds.length) {
      const foundRoleIds = existingRoles.map((role) => role.id);
      const missingRoleIds = roleIds.filter((id) => !foundRoleIds.includes(id));
      throw new BadRequestException(
        `The following role IDs do not exist: ${missingRoleIds.join(', ')}`,
      );
    }
  }

  /**
   * Basic user select structure for consistent user data selection
   */
  static getUserSelectStructure() {
    return {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      imageUrl: true,
    };
  }
}
