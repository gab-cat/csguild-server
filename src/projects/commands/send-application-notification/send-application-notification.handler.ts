import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../common/logger/logger.service';
import { SendApplicationNotificationCommand } from './send-application-notification.command';
import { SendProjectApplicationNotificationCommand } from 'src/common/email/commands';

@Injectable()
@CommandHandler(SendApplicationNotificationCommand)
export class SendApplicationNotificationHandler
  implements ICommandHandler<SendApplicationNotificationCommand>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SendApplicationNotificationCommand): Promise<void> {
    const {
      ownerEmail,
      ownerFirstName,
      projects,
      totalApplications,
      timeWindow,
      schedule,
    } = command;

    try {
      await this.commandBus.execute(
        new SendProjectApplicationNotificationCommand({
          email: ownerEmail,
          firstName: ownerFirstName || 'Project Owner',
          projects,
          totalApplications,
          timeWindow,
          schedule,
        }),
      );

      this.logger.info(
        `[${schedule}] Sent application notification to ${ownerEmail}`,
        {
          ownerEmail,
          projectCount: projects.length,
          totalApplications,
        },
        'SendApplicationNotificationHandler',
      );
    } catch (error) {
      this.logger.error(
        `[${schedule}] Failed to send notification to ${ownerEmail}`,
        error,
        'SendApplicationNotificationHandler',
      );
      throw error;
    }
  }
}
