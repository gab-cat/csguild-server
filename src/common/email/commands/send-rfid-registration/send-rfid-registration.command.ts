import { Command } from '@nestjs/cqrs';

export interface SendRfidRegistrationParams {
  email: string;
  firstName: string;
  rfidId: string;
}

export class SendRfidRegistrationCommand extends Command<void> {
  constructor(public readonly params: SendRfidRegistrationParams) {
    super();
  }
}
