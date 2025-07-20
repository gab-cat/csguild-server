import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendFeedbackNotificationCommand } from './send-feedback-notification.command';

@Injectable()
@CommandHandler(SendFeedbackNotificationCommand)
export class SendFeedbackNotificationHandler
  implements ICommandHandler<SendFeedbackNotificationCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendFeedbackNotificationCommand): Promise<void> {
    const { email, firstName, eventTitle, feedbackUrl, organizerName } =
      command.params;

    await this.mailgunService.sendMail({
      to: email,
      subject: `Feedback Request: ${eventTitle}`,
      template: 'feedback-notification',
      context: {
        firstName,
        eventTitle,
        feedbackUrl,
        organizerName,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }
}
