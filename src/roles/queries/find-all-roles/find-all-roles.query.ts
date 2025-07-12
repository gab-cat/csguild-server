import { RoleFilters, RolePagination } from '../../types/role.types';

export class FindAllRolesQuery {
  constructor(
    public readonly filters: RoleFilters,
    public readonly pagination: RolePagination,
  ) {}
}
