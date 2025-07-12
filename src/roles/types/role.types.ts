import { UserRole } from '../../../generated/prisma';

export type RoleEntity = UserRole;

export interface RoleFilters {
  search?: string;
}

export interface RolePagination {
  page: number;
  limit: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'slug';
  sortOrder?: 'asc' | 'desc';
}
