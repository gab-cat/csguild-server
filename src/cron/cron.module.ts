import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { UsersModule } from '../users/users.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [UsersModule, LoggerModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
