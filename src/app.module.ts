import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { EmailModule } from './common/email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { LogsController } from './common/logger/logger.controller';
import { ThrottlerModule } from '@nestjs/throttler';
import { RATE_LIMITING } from './constants';

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
    PrismaModule,
    LoggerModule,
    EmailModule,
    AuthModule,
    UsersModule,
    FacilitiesModule,
  ],
  controllers: [AppController, LogsController],
  providers: [AppService],
})
export class AppModule {}
