import { ProjectFilters, PaginationParams } from '../../types/project.types';

export class FindAllProjectsQuery {
  constructor(
    public readonly filters: ProjectFilters = {},
    public readonly pagination: PaginationParams = {},
  ) {}
}
