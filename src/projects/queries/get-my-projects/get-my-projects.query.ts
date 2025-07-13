import { Query } from '@nestjs/cqrs';
import { ProjectSummary } from 'src/projects/types/project.types';

export class GetMyProjectsQuery extends Query<ProjectSummary[]> {
  constructor(public readonly userSlug: string) {
    super();
  }
}
