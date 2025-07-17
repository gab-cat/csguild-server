import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendApplicationAcceptedCommand } from './send-application-accepted.command';

@Injectable()
@CommandHandler(SendApplicationAcceptedCommand)
export class SendApplicationAcceptedHandler
  implements ICommandHandler<SendApplicationAcceptedCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendApplicationAcceptedCommand): Promise<void> {
    const { email, firstName, projectName, roleName, reviewMessage } =
      command.params;

    await this.mailgunService.sendMail({
      to: email,
      subject: `CSGUILD - Application Accepted for ${projectName}`,
      template: 'application-accepted',
      context: {
        firstName,
        projectName,
        roleName,
        reviewMessage,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        projectUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/projects/${encodeURIComponent(
          projectName.toLowerCase().replace(/\s+/g, '-'),
        )}`,
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
      },
    });
  }
}
