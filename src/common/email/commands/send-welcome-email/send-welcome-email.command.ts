import { Command } from '@nestjs/cqrs';

export interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
  username: string;
}

export class SendWelcomeEmailCommand extends Command<void> {
  constructor(public readonly params: SendWelcomeEmailParams) {
    super();
  }
}
