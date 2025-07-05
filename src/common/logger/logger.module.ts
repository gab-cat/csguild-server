import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from './logger.service';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { LogGateway } from './logger.gateway';
import { UsersModule } from '../../users/users.module';
import { AuthModule } from '../../auth/auth.module';

@Global()
@Module({
  imports: [UsersModule, AuthModule],
  providers: [LoggerService, HttpLoggingInterceptor, LogGateway, JwtService],
  exports: [LoggerService, HttpLoggingInterceptor, LogGateway],
})
export class LoggerModule {}
