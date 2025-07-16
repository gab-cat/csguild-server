import { Command } from '@nestjs/cqrs';

export class UnsaveProjectCommand extends Command<void> {
  constructor(
    public readonly projectSlug: string,
    public readonly userSlug: string,
  ) {
    super();
  }
}
