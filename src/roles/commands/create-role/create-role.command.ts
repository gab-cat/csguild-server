import { RoleEntity } from 'src/roles/types';
import { CreateRoleDto } from '../../dto';
import { Command } from '@nestjs/cqrs';

export class CreateRoleCommand extends Command<RoleEntity> {
  constructor(public readonly createRoleDto: CreateRoleDto) {
    super();
  }
}
