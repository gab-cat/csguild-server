import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendRfidRegistrationCommand } from './send-rfid-registration.command';

@Injectable()
@CommandHandler(SendRfidRegistrationCommand)
export class SendRfidRegistrationHandler
  implements ICommandHandler<SendRfidRegistrationCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendRfidRegistrationCommand): Promise<void> {
    const { email, firstName, rfidId } = command.params;

    await this.mailgunService.sendMail({
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
