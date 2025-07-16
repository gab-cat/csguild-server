import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendWelcomeEmailCommand } from './send-welcome-email.command';

@Injectable()
@CommandHandler(SendWelcomeEmailCommand)
export class SendWelcomeEmailHandler
  implements ICommandHandler<SendWelcomeEmailCommand>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendWelcomeEmailCommand): Promise<void> {
    const { email, firstName, username } = command.params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to CSGUILD!',
      template: 'welcome',
      context: {
        firstName,
        username,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        loginUrl: this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        ),
      },
    });
  }
}
