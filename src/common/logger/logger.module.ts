import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from './logger.service';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { LogGateway } from './logger.gateway';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../../auth/auth.service';

@Global()
@Module({
  providers: [
    LoggerService,
    HttpLoggingInterceptor,
    LogGateway,
    JwtService,
    UsersService,
    AuthService,
  ],
  exports: [LoggerService, HttpLoggingInterceptor, LogGateway],
})
export class LoggerModule {}
