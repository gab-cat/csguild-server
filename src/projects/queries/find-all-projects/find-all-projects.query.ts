import { ProjectFilters, PaginationParams } from '../../types/project.types';

/**
 * Query object for retrieving all projects with optional filtering and pagination.
 *
 * @param filters - Criteria to filter the list of projects.
 * @param pagination - Parameters to control pagination of the results.
 */
export class FindAllProjectsQuery {
  constructor(
    public readonly filters: ProjectFilters = {},
    public readonly pagination: PaginationParams = {},
  ) {}
}
