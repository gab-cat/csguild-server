import { Command } from '@nestjs/cqrs';

export interface SendEmailVerificationParams {
  email: string;
  firstName: string;
  verificationCode: string;
}

export class SendEmailVerificationCommand extends Command<void> {
  constructor(public readonly params: SendEmailVerificationParams) {
    super();
  }
}
