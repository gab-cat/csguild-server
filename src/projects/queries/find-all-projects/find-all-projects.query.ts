import { Query } from '@nestjs/cqrs';
import {
  ProjectFilters,
  PaginationParams,
  ProjectListResponse,
} from '../../types/project.types';

/**
 * Query object for retrieving all projects with optional filtering and pagination.
 *
 * @param filters - Criteria to filter the list of projects.
 * @param pagination - Parameters to control pagination of the results.
 */
export class FindAllProjectsQuery extends Query<ProjectListResponse> {
  constructor(
    public readonly filters: ProjectFilters = {},
    public readonly pagination: PaginationParams = {},
  ) {
    super();
  }
}
