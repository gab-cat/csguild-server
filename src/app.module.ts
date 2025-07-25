import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { EmailModule } from './common/email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { EventsModule } from './events/events.module';
import { RolesModule } from './roles/roles.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { CronModule } from './common/cron/cron.module';
import { LogsController } from './common/logger/logger.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMITING } from './constants';
import { UtilsModule } from './common/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'login-attempts',
        ttl: RATE_LIMITING.THROTTLE.LOGIN_ATTEMPTS.TTL,
        limit: RATE_LIMITING.THROTTLE.LOGIN_ATTEMPTS.LIMIT,
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    LoggerModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    EventsModule,
    RolesModule,
    FacilitiesModule,
    CronModule,
    UtilsModule,
  ],
  controllers: [AppController, LogsController],
})
export class AppModule {}
