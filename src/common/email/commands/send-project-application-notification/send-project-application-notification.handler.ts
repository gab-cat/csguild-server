import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailgunService } from '../../mailgun.service';
import { SendProjectApplicationNotificationCommand } from './send-project-application-notification.command';

@Injectable()
@CommandHandler(SendProjectApplicationNotificationCommand)
export class SendProjectApplicationNotificationHandler
  implements ICommandHandler<SendProjectApplicationNotificationCommand>
{
  constructor(
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: SendProjectApplicationNotificationCommand,
  ): Promise<void> {
    const {
      email,
      firstName,
      projects,
      totalApplications,
      timeWindow,
      schedule,
    } = command.params;

    const subjectText = totalApplications !== 1 ? 's' : '';
    const projectText = projects.length !== 1 ? 's' : '';

    await this.mailgunService.sendMail({
      to: email,
      subject: `CSGUILD - ${totalApplications} New Application${subjectText} to Your Project${projectText}`,
      template: 'project-application-notification',
      context: {
        firstName,
        projects,
        totalApplications,
        timeWindow,
        schedule,
        hasMultipleProjects: projects.length > 1,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
        projectsUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/my-projects`,
      },
    });
  }
}
