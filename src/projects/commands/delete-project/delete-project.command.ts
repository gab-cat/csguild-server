import { Command } from '@nestjs/cqrs';

export class DeleteProjectCommand extends Command<void> {
  constructor(
    public readonly slug: string,
    public readonly userSlug: string,
  ) {
    super();
  }
}
