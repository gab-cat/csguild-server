import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendPasswordResetCommand } from './send-password-reset.command';

@Injectable()
@CommandHandler(SendPasswordResetCommand)
export class SendPasswordResetHandler
  implements ICommandHandler<SendPasswordResetCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendPasswordResetCommand): Promise<void> {
    const { email, firstName, resetToken } = command.params;

    await this.mailgunService.sendMail({
      to: email,
      subject: 'CSGUILD - Password Reset Request',
      template: 'password-reset',
      context: {
        firstName,
        organizationName: 'CSGUILD',
        resetUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/reset-password?token=${encodeURIComponent(resetToken)}`,
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }
}
