import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CronService } from './cron.service';
import { UsersModule } from '../../users/users.module';
import { LoggerModule } from '../logger/logger.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UsersModule, LoggerModule, PrismaModule, EmailModule, CqrsModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
