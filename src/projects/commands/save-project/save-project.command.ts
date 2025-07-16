import { Command } from '@nestjs/cqrs';

export class SaveProjectCommand extends Command<{
  id: string;
  userSlug: string;
  projectSlug: string;
  savedAt: Date;
}> {
  constructor(
    public readonly projectSlug: string,
    public readonly userSlug: string,
  ) {
    super();
  }
}
