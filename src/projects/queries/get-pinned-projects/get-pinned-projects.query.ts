import { Query } from '@nestjs/cqrs';
import { ProjectListResponse } from '../../types/project.types';

/**
 * Query object for retrieving globally pinned projects.
 * Returns projects pinned by administrators in order.
 */
export class GetPinnedProjectsQuery extends Query<ProjectListResponse> {
  constructor() {
    super();
  }
}
