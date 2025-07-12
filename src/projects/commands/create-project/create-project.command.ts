import { CreateProjectDto } from '../../dto';

export class CreateProjectCommand {
  constructor(
    public readonly createProjectDto: CreateProjectDto,
    public readonly ownerId: string,
  ) {}
}
