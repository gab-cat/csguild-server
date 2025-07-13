import { Query } from '@nestjs/cqrs';
import { RoleResponseDto } from 'src/roles/dto';

export class FindRoleBySlugQuery extends Query<RoleResponseDto> {
  constructor(public readonly slug: string) {
    super();
  }
}
