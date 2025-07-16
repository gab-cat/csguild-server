import { Command } from '@nestjs/cqrs';

export interface SendPasswordResetParams {
  email: string;
  firstName: string;
  resetToken: string;
}

export class SendPasswordResetCommand extends Command<void> {
  constructor(public readonly params: SendPasswordResetParams) {
    super();
  }
}
