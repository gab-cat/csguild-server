import { Query } from '@nestjs/cqrs';
import { Project } from 'generated/prisma/client';

export class GetProjectBasicInfoQuery extends Query<Project> {
  constructor(public readonly projectSlug: string) {
    super();
  }
}
