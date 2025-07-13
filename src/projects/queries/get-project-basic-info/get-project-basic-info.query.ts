import { Query } from '@nestjs/cqrs';
import { Project, User } from 'generated/prisma/client';

export class GetProjectBasicInfoQuery extends Query<
  Project & {
    owner: Pick<User, 'username' | 'firstName' | 'lastName' | 'imageUrl'>;
  }
> {
  constructor(public readonly projectSlug: string) {
    super();
  }
}
