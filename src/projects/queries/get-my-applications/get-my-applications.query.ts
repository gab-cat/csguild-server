import { Query } from '@nestjs/cqrs';
import { ProjectApplication } from 'generated/prisma/client';

export class GetMyApplicationsQuery extends Query<ProjectApplication[]> {
  constructor(public readonly userSlug: string) {
    super();
  }
}
