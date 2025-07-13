import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FindRoleBySlugQuery } from './find-role-by-slug.query';
import { RoleResponseDto } from '../../dto';
import { RoleUtils } from '../../utils';

@Injectable()
@QueryHandler(FindRoleBySlugQuery)
export class FindRoleBySlugHandler
  implements IQueryHandler<FindRoleBySlugQuery>
{
  constructor(private readonly roleUtils: RoleUtils) {}

  async execute(query: FindRoleBySlugQuery): Promise<RoleResponseDto> {
    const { slug } = query;

    const role = await this.roleUtils.getRoleBySlug(slug);

    if (!role) {
      throw new NotFoundException(`Role with slug '${slug}' not found`);
    }

    return role;
  }
}
