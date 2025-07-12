import { JoinProjectDto } from '../../dto';

export class JoinProjectCommand {
  constructor(
    public readonly joinProjectDto: JoinProjectDto,
    public readonly userId: string,
  ) {}
}
