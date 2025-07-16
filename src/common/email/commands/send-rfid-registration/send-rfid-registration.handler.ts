import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendRfidRegistrationCommand } from './send-rfid-registration.command';

@Injectable()
@CommandHandler(SendRfidRegistrationCommand)
export class SendRfidRegistrationHandler
  implements ICommandHandler<SendRfidRegistrationCommand>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendRfidRegistrationCommand): Promise<void> {
    const { email, firstName, rfidId } = command.params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'CSGUILD - RFID Registration Successful',
      template: 'rfid-registration',
      context: {
        firstName,
        rfidId,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }
}
