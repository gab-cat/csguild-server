import { Command } from '@nestjs/cqrs';

export class UnpinProjectCommand extends Command<void> {
  constructor(
    public readonly projectSlug: string,
    public readonly adminUsername: string,
  ) {
    super();
  }
}
