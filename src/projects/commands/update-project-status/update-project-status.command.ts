import { UpdateProjectStatusDto } from '../../dto';
import { Command } from '@nestjs/cqrs';
import { Project } from '../../../../generated/prisma';

export class UpdateProjectStatusCommand extends Command<Project> {
  constructor(
    public readonly slug: string,
    public readonly updateStatusDto: UpdateProjectStatusDto,
    public readonly userSlug: string,
  ) {
    super();
  }
}
