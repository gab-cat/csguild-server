import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendEmailVerificationCommand } from './send-email-verification.command';

@Injectable()
@CommandHandler(SendEmailVerificationCommand)
export class SendEmailVerificationHandler
  implements ICommandHandler<SendEmailVerificationCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendEmailVerificationCommand): Promise<void> {
    const { email, firstName, verificationCode } = command.params;

    await this.mailgunService.sendMail({
      to: email,
      subject: 'CSGUILD - Verify Your Email Address',
      template: 'email-verification',
      context: {
        firstName,
        verificationCode,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }
}
