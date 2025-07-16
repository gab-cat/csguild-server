import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SendApplicationRejectedCommand } from './send-application-rejected.command';

@Injectable()
@CommandHandler(SendApplicationRejectedCommand)
export class SendApplicationRejectedHandler
  implements ICommandHandler<SendApplicationRejectedCommand>
{
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendApplicationRejectedCommand): Promise<void> {
    const { email, firstName, projectName, roleName, reviewMessage } =
      command.params;

    await this.mailerService.sendMail({
      to: email,
      subject: `CSGUILD - Application Update for ${projectName}`,
      template: 'application-rejected',
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
        projectsUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/projects`,
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
      },
    });
  }
}
