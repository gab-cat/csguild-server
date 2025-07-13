import { Command } from '@nestjs/cqrs';
import { UpdateRoleDto } from '../../dto';
import { RoleEntity } from 'src/roles/types';

export class UpdateRoleCommand extends Command<RoleEntity> {
  constructor(
    public readonly slug: string,
    public readonly updateRoleDto: UpdateRoleDto,
  ) {
    super();
  }
}
