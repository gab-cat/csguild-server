import { Command } from '@nestjs/cqrs';
import { JoinProjectDto } from '../../dto';
import { ProjectApplication } from '../../../../generated/prisma';

export class JoinProjectCommand extends Command<ProjectApplication> {
  constructor(
    public readonly joinProjectDto: JoinProjectDto,
    public readonly userSlug: string,
  ) {
    super();
  }
}
