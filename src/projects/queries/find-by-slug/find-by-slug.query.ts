import { Query } from '@nestjs/cqrs';
import { ProjectDetailResponse } from 'src/projects/types/project.types';

export class FindBySlugQuery extends Query<ProjectDetailResponse> {
  constructor(public readonly slug: string) {
    super();
  }
}
