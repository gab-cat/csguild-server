import { Query } from '@nestjs/cqrs';
import { RoleResponseDto } from 'src/roles/dto/role-response.dto';

export class FindRoleByIdQuery extends Query<RoleResponseDto> {
  constructor(public readonly id: string) {
    super();
  }
}
