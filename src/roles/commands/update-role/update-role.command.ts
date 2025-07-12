import { UpdateRoleDto } from '../../dto';

export class UpdateRoleCommand {
  constructor(
    public readonly id: string,
    public readonly updateRoleDto: UpdateRoleDto,
  ) {}
}
