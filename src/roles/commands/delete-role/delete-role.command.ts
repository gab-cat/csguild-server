import { Command } from '@nestjs/cqrs';

export class DeleteRoleCommand extends Command<void> {
  constructor(public readonly slug: string) {
    super();
  }
}
