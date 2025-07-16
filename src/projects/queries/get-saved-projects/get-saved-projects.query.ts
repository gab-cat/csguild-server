import { Query } from '@nestjs/cqrs';
import { ProjectListResponse, PaginationParams } from '../../types/project.types';

/**
 * Query object for retrieving user's saved projects.
 * Returns projects saved by the authenticated user ordered by savedAt (most recent first).
 */
export class GetSavedProjectsQuery extends Query<ProjectListResponse> {
  constructor(
    public readonly userSlug: string,
    public readonly pagination: PaginationParams = {}
  ) {
    super();
  }
}