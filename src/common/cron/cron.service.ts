import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsersService } from '../../users/users.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class CronService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  onModuleInit() {
    this.logger.info(
      'CronService initialized - cron jobs are now active',
      {
        jobs: [
          'Every 5 seconds: User timeout check',
          'Daily at 8 PM: User timeout cleanup',
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
}
