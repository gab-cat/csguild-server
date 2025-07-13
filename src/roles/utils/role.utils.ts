import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RoleEntity } from '../types/role.types';

@Injectable()
export class RoleUtils {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a URL-friendly slug from a role name
   */
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get role by ID with error handling
   */
  async getRoleById(id: string): Promise<RoleEntity | null> {
    const role = await this.prisma.userRole.findUnique({
      where: { id },
    });

    return role;
  }

  /**
   * Get role by slug with error handling
   */
  async getRoleBySlug(slug: string): Promise<RoleEntity | null> {
    const role = await this.prisma.userRole.findUnique({
      where: { slug },
    });

    return role;
  }

  /**
   * Check if a role name or slug already exists (excluding a specific role ID)
   */
  async checkRoleExists(
    name?: string,
    slug?: string,
    excludeId?: string,
  ): Promise<{ exists: boolean; conflictField?: 'name' | 'slug' }> {
    if (!name && !slug) {
      return { exists: false };
    }

    const where: any = {
      OR: [...(name ? [{ name }] : []), ...(slug ? [{ slug }] : [])],
    };

    if (excludeId) {
      where.AND = [{ id: { not: excludeId } }];
    }

    const existingRole = await this.prisma.userRole.findFirst({
      where,
    });

    if (!existingRole) {
      return { exists: false };
    }

    const conflictField = existingRole.name === name ? 'name' : 'slug';
    return { exists: true, conflictField };
  }

  /**
   * Get count of users assigned to a role
   */
  async getRoleUsageCount(roleId: string): Promise<{
    userCount: number;
    projectCount: number;
  }> {
    const [userCount, projectCount] = await Promise.all([
      this.prisma.user.count({
        where: { userRoles: { some: { id: roleId } } },
      }),
      this.prisma.projectRole.count({
        where: { roleId },
      }),
    ]);

    return { userCount, projectCount };
  }

  /**
   * Check if a role can be safely deleted (not assigned to users or projects)
   */
  async canDeleteRole(roleId: string): Promise<{
    canDelete: boolean;
    reason?: string;
  }> {
    const usage = await this.getRoleUsageCount(roleId);

    if (usage.userCount > 0) {
      return {
        canDelete: false,
        reason: `Role is assigned to ${usage.userCount} user(s)`,
      };
    }

    if (usage.projectCount > 0) {
      return {
        canDelete: false,
        reason: `Role is used in ${usage.projectCount} project(s)`,
      };
    }

    return { canDelete: true };
  }
}
