import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const { statusCode } = response;

          // Determine log level based on status code
          if (statusCode >= 500) {
            this.logger.error(
              `← ${method} ${url} ${statusCode}`,
              {
                ip,
                userAgent: userAgent.substring(0, 100),
                responseTime: `${responseTime}ms`,
                statusCode,
              },
              'HTTP',
              'route',
            );
          } else if (statusCode >= 400) {
            this.logger.warn(
              `← ${method} ${url} ${statusCode}`,
              {
                ip,
                userAgent: userAgent.substring(0, 100),
                responseTime: `${responseTime}ms`,
                statusCode,
              },
              'HTTP',
              'route',
            );
          } else {
            this.logger.info(
              `← ${method} ${url} ${statusCode} ${responseTime}ms | ${ip} | ${userAgent.substring(0, 100)} `,
              undefined,
              'HTTP',
              'route',
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = error.status || 500;

          this.logger.error(
            `← ${method} ${url} ${statusCode} ERROR`,
            {
              ip,
              userAgent: userAgent.substring(0, 100),
              responseTime: `${responseTime}ms`,
              statusCode,
              error: error.message,
            },
            'HTTP',
            'route',
          );
        },
      }),
    );
  }
}
