/* eslint-disable max-len */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { UsersService } from '../../users/users.service';
import { LoggerService } from '../logger/logger.service';
import { GetNewApplicationsQuery } from '../../projects/queries/get-new-applications/get-new-applications.query';
import { SendApplicationNotificationCommand } from '../../projects/commands/send-application-notification/send-application-notification.command';
import type { ApplicationsByOwner } from '../../projects/queries/get-new-applications/get-new-applications.handler';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  onModuleInit() {
    this.logger.info(
      'CronService initialized - cron jobs are now active',
      {
        jobs: [
          'Every 5 seconds: User timeout check',
          'Daily at 8 PM: User timeout cleanup',
          'Daily at 8 AM, 2 PM, 8 PM: Project application notifications',
        ],
      },
      'CronService',
    );
  }
  // Run every day at 8 PM local time (20:00)
  @Cron('0 20 * * *', {
    name: 'timeoutUsersDaily',
    timeZone: 'Asia/Manila',
  })
  async timeoutUsersDaily() {
    try {
      const result = await this.usersService.timeoutAllActiveUsers();

      this.logger.info(
        `[Daily 8PM] CRON timeout executed: ${result.totalTimedOut} users timed out`,
        result,
        'CronService',
      );
    } catch (error) {
      this.logger.error(
        '[Daily 8PM] Error during daily user timeout execution',
        error,
        'CronService',
      );
    }
  }

  // Run at 8:00 AM - Check applications from 8:00 PM (previous day) to 8:00 AM
  @Cron('0 8 * * *', {
    name: 'notifyProjectOwnersMorning',
    timeZone: 'Asia/Manila',
  })
  async notifyProjectOwnersMorning() {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(20, 0, 0, 0); // 8:00 PM
    startTime.setDate(startTime.getDate() - 1); // Previous day

    const endTime = new Date(now);
    endTime.setHours(8, 0, 0, 0); // 8:00 AM today

    await this.notifyProjectOwnersAboutNewApplications(
      startTime,
      endTime,
      '8:00 AM',
    );
  }

  // Run at 2:00 PM - Check applications from 8:00 AM to 2:00 PM
  @Cron('0 14 * * *', {
    name: 'notifyProjectOwnersAfternoon',
    timeZone: 'Asia/Manila',
  })
  async notifyProjectOwnersAfternoon() {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(8, 0, 0, 0); // 8:00 AM

    const endTime = new Date(now);
    endTime.setHours(14, 0, 0, 0); // 2:00 PM

    await this.notifyProjectOwnersAboutNewApplications(
      startTime,
      endTime,
      '2:00 PM',
    );
  }

  // Run at 8:00 PM - Check applications from 2:00 PM to 8:00 PM
  @Cron('0 20 * * *', {
    name: 'notifyProjectOwnersEvening',
    timeZone: 'Asia/Manila',
  })
  async notifyProjectOwnersEvening() {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(14, 0, 0, 0); // 2:00 PM

    const endTime = new Date(now);
    endTime.setHours(20, 0, 0, 0); // 8:00 PM

    await this.notifyProjectOwnersAboutNewApplications(
      startTime,
      endTime,
      '8:00 PM',
    );
  }

  private async notifyProjectOwnersAboutNewApplications(
    startTime: Date,
    endTime: Date,
    schedule: string,
  ) {
    try {
      // Use the query bus to get new applications
      const applicationsByOwner: ApplicationsByOwner[] =
        await this.queryBus.execute(
          new GetNewApplicationsQuery(startTime, endTime),
        );

      if (applicationsByOwner.length === 0) {
        const timeWindow = `${startTime.toISOString()} - ${endTime.toISOString()}`;
        this.logger.info(
          `[${schedule}] No new applications found for time window: ${timeWindow}`,
          {},
          'CronService',
        );
        return;
      }

      let totalNotifiedOwners = 0;
      let totalApplications = 0;

      // Send notifications to each project owner
      for (const ownerData of applicationsByOwner) {
        try {
          // Prepare projects data for email template
          const projects = ownerData.projects.map((projectData) => ({
            name: projectData.project.title,
            slug: projectData.project.slug,
            applicationCount: projectData.applications.length,
            applications: projectData.applications.map((app) => ({
              applicantName:
                `${app.user.firstName} ${app.user.lastName}`.trim(),
              applicantEmail: app.user.email,
              roleName: app.projectRole.role.name,
              message: app.message || '',
              appliedAt: app.appliedAt,
            })),
          }));

          const ownerApplicationCount = projects.reduce(
            (sum, project) => sum + project.applicationCount,
            0,
          );

          totalApplications += ownerApplicationCount;

          // Use the command bus to send notification
          await this.commandBus.execute(
            new SendApplicationNotificationCommand(
              ownerData.owner.email,
              ownerData.owner.firstName || 'Project Owner',
              projects,
              ownerApplicationCount,
              `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`,
              schedule,
            ),
          );

          totalNotifiedOwners++;
        } catch (notificationError) {
          this.logger.error(
            `[${schedule}] Failed to send notification to ${ownerData.owner.email}`,
            notificationError,
            'CronService',
          );
        }
      }

      this.logger.info(
        `[${schedule}] CRON application notifications executed: ` +
          `Notified ${totalNotifiedOwners} project owners about ${totalApplications} new applications`,
        {
          totalApplications,
          totalNotifiedOwners,
          timeWindow: `${startTime.toISOString()} - ${endTime.toISOString()}`,
        },
        'CronService',
      );
    } catch (error) {
      this.logger.error(
        `[${schedule}] Error during application notification execution`,
        error,
        'CronService',
      );
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    });
  }
}
