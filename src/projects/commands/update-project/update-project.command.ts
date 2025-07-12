import { UpdateProjectDto } from '../../dto';

export class UpdateProjectCommand {
  constructor(
    public readonly id: string,
    public readonly updateProjectDto: UpdateProjectDto,
    public readonly userId: string,
  ) {}
}
