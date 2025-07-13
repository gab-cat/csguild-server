import { Command } from '@nestjs/cqrs';
import { CreateProjectDto } from '../../dto';
import { Project } from '../../../../generated/prisma';

export class CreateProjectCommand extends Command<Project> {
  constructor(
    public readonly createProjectDto: CreateProjectDto,
    public readonly ownerSlug: string,
  ) {
    super();
  }
}
