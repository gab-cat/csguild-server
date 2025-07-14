import { Command } from '@nestjs/cqrs';

export class ReactivateProjectMemberCommand extends Command<void> {
  constructor(
    public readonly projectSlug: string,
    public readonly memberUserSlug: string,
    public readonly requestorUserSlug: string,
  ) {
    super();
  }
}
