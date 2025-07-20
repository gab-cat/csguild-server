import { Command } from '@nestjs/cqrs';

export interface SendEventRegistrationConfirmationParams {
  email: string;
  firstName: string;
  username: string;
  eventTitle: string;
  eventSlug: string;
  eventStartDate: Date;
  eventEndDate: Date | null;
}

export class SendEventRegistrationConfirmationCommand extends Command<void> {
  constructor(public readonly params: SendEventRegistrationConfirmationParams) {
    super();
  }
}
