import { UpdateProjectStatusDto } from '../../dto';

export class UpdateProjectStatusCommand {
  constructor(
    public readonly id: string,
    public readonly updateStatusDto: UpdateProjectStatusDto,
    public readonly userId: string,
  ) {}
}
