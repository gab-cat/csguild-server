import { Command } from '@nestjs/cqrs';

export interface SendFeedbackNotificationParams {
  email: string;
  firstName: string;
  eventTitle: string;
  feedbackUrl: string;
  organizerName: string;
}

export class SendFeedbackNotificationCommand extends Command<void> {
  constructor(public readonly params: SendFeedbackNotificationParams) {
    super();
  }
}
