import { Query } from '@nestjs/cqrs';
import { ProjectApplication } from 'generated/prisma/client';

export class GetProjectApplicationsQuery extends Query<ProjectApplication[]> {
  constructor(
    public readonly projectSlug: string,
    public readonly roleSlug?: string, // Optional: filter by specific role
  ) {
    super();
  }
}
