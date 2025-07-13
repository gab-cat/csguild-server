import {
  Project,
  ProjectStatus,
  UserRole,
  ProjectRole,
  ProjectMember,
  ProjectApplication,
  ApplicationStatus,
  MemberStatus,
  User,
} from '../../../generated/prisma';

// Basic Project interface
export interface ProjectEntity extends Project {
  owner: User;
  roles: ProjectRole[];
  members: ProjectMember[];
  applications: ProjectApplication[];
}

// Project with owner details for display
export interface ProjectWithOwner extends Project {
  owner: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  roles: ProjectRoleWithDetails[];
  _count?: {
    members: number;
    applications: number;
  };
}

// Lighter view for project listings
export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  dueDate?: Date;
  status: ProjectStatus;
  createdAt: Date;
  owner: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
  roles: {
    roleSlug: string;
    role: {
      name: string;
      slug: string;
    };
    maxMembers?: number;
    requirements: string;
    currentMembers: number;
  }[];
  memberCount: number;
  applicationCount: number;
}

// Project role with user role details
export interface ProjectRoleWithDetails extends ProjectRole {
  role: UserRole;
  members: ProjectMemberWithUser[];
  applications: ProjectApplicationWithUser[];
  _count?: {
    members: number;
    applications: number;
  };
}

// Project member with user details
export interface ProjectMemberWithUser extends ProjectMember {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  projectRole: {
    roleSlug: string;
    role: {
      name: string;
      slug: string;
    };
  };
}

// Project application with user details
export interface ProjectApplicationWithUser extends ProjectApplication {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    imageUrl?: string;
  };
  projectRole: {
    roleSlug: string;
    role: {
      name: string;
      slug: string;
    };
  };
  reviewer?: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

// User role with basic info
export interface UserRoleBasic {
  slug: string;
  name: string;
  description?: string;
}

// Enums for type safety
export { ProjectStatus, ApplicationStatus, MemberStatus };

// Query filters
export interface ProjectFilters {
  status?: ProjectStatus;
  tags?: string[];
  ownerSlug?: string;
  search?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type ProjectListResponse = PaginatedResponse<ProjectSummary>;
export type ProjectDetailResponse = ProjectWithOwner;
