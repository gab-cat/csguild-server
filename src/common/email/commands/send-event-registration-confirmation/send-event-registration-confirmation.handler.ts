import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendEventRegistrationConfirmationCommand } from './send-event-registration-confirmation.command';

@Injectable()
@CommandHandler(SendEventRegistrationConfirmationCommand)
export class SendEventRegistrationConfirmationHandler
  implements ICommandHandler<SendEventRegistrationConfirmationCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: SendEventRegistrationConfirmationCommand,
  ): Promise<void> {
    const {
      email,
      firstName,
      username,
      eventTitle,
      eventSlug,
      eventStartDate,
      eventEndDate,
    } = command.params;

    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    await this.mailgunService.sendMail({
      to: email,
      subject: `Event Registration Confirmed: ${eventTitle}`,
      template: 'event-registration-confirmation',
      context: {
        firstName,
        username,
        eventTitle,
        eventSlug,
        eventStartDate: eventStartDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        eventStartTime: eventStartDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventEndDate: eventEndDate
          ? eventEndDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null,
        eventEndTime: eventEndDate
          ? eventEndDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : null,
        eventUrl: `${frontendUrl}/events/${eventSlug}`,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        frontendUrl,
      },
    });
  }
}
