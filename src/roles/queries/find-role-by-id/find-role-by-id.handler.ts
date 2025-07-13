import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindRoleByIdQuery } from './find-role-by-id.query';
import { RoleResponseDto } from '../../dto';
import { RoleUtils } from '../../utils';

@Injectable()
@QueryHandler(FindRoleByIdQuery)
export class FindRoleByIdHandler implements IQueryHandler<FindRoleByIdQuery> {
  constructor(private readonly roleUtils: RoleUtils) {}

  async execute(query: FindRoleByIdQuery): Promise<RoleResponseDto> {
    const { id } = query;

    const role = await this.roleUtils.getRoleById(id);

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }
}
