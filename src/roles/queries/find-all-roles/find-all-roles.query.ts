import { Query } from '@nestjs/cqrs';
import { RoleFilters, RolePagination } from '../../types/role.types';
import { RoleListResponseDto } from 'src/roles/dto';

export class FindAllRolesQuery extends Query<RoleListResponseDto> {
  constructor(
    public readonly filters: RoleFilters,
    public readonly pagination: RolePagination,
  ) {
    super();
  }
}
