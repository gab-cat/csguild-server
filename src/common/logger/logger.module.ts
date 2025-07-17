import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { LogGateway } from './logger.gateway';
import { UsersModule } from '../../users/users.module';
import { AuthModule } from '../../auth/auth.module';

@Global()
@Module({
  imports: [
    UsersModule,
    AuthModule,
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logLevel = configService.get('LOG_LEVEL') || 'info';

        // Base Pino configuration - always use pretty logs
        const pinoConfig = {
          pinoHttp: {
            level: logLevel,
            // Always use pino-pretty for readable logs in all environments
            transport: {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                singleLine: false,
                // Ensure output goes to stdout for Docker
                destination: 1, // stdout
              },
            },
            // Ensure logs go to stdout/stderr in Docker
            stream: process.stdout,
            serializers: {
              req: (req: any) => ({
                method: req.method,
                url: req.url,
                headers: {
                  'user-agent': req.headers['user-agent'],
                  'content-type': req.headers['content-type'],
                },
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
            },
          },
        };

        return pinoConfig;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [LoggerService, HttpLoggingInterceptor, LogGateway, JwtService],
  exports: [LoggerService, HttpLoggingInterceptor, LogGateway],
})
export class LoggerModule {}
