import { UpdateProjectDto } from '../../dto';
import { Command } from '@nestjs/cqrs';
import { Project } from '../../../../generated/prisma';

export class UpdateProjectCommand extends Command<Project> {
  constructor(
    public readonly slug: string,
    public readonly updateProjectDto: UpdateProjectDto,
    public readonly userSlug: string,
  ) {
    super();
  }
}
