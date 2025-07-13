import { Query } from '@nestjs/cqrs';
import { ProjectMember } from 'generated/prisma/client';

export class GetProjectMembersQuery extends Query<ProjectMember[]> {
  constructor(
    public readonly projectSlug: string,
    public readonly roleSlug?: string, // Optional: filter by specific role
  ) {
    super();
  }
}
