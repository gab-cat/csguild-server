import { Command } from '@nestjs/cqrs';

export class PinProjectCommand extends Command<{
  id: string;
  projectSlug: string;
  pinnedAt: Date;
  order: number;
  pinnedBy: string;
}> {
  constructor(
    public readonly projectSlug: string,
    public readonly adminUsername: string,
  ) {
    super();
  }
}
