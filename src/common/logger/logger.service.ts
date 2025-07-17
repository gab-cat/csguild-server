import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

export interface LogContext {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  service?: string;
  category?: 'service' | 'route';
}

export interface LogEmitter {
  emit(event: string, data: any): void;
}

@Injectable()
export class LoggerService {
  private readonly serviceName: string;
  private logEmitter: LogEmitter | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.serviceName =
      this.configService.get('SERVICE_NAME') || 'CS Guild Server';

    // Set the logger context for this service
    this.logger.setContext(this.serviceName);

    // Log initialization with pretty format
    this.logger.info({
      message: 'Logger initialized with Pino (pretty format)',
      service: this.serviceName,
      logLevel: this.configService.get('LOG_LEVEL') || 'info',
      isDocker: process.env.DOCKER_CONTAINER === 'true',
      nodeEnv: process.env.NODE_ENV,
    });
  }

  setLogEmitter(emitter: LogEmitter): void {
    this.logEmitter = emitter;
  }

  private emitLogEvent(
    level: string,
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    if (this.logEmitter) {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: level.toUpperCase(),
        message,
        ...(context && { context }),
        service: service || this.serviceName,
        category,
      };
      this.logEmitter.emit('log', logEntry);
    }
  }

  error(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    const logData = {
      message,
      service: service || this.serviceName,
      category,
      ...(context && { context }),
    };

    this.logger.error(logData, message);
    this.emitLogEvent('error', message, context, service, category);
  }

  warn(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    const logData = {
      message,
      service: service || this.serviceName,
      category,
      ...(context && { context }),
    };

    this.logger.warn(logData, message);
    this.emitLogEvent('warn', message, context, service, category);
  }

  info(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    const logData = {
      message,
      service: service || this.serviceName,
      category,
      ...(context && { context }),
    };

    this.logger.info(logData, message);
    this.emitLogEvent('info', message, context, service, category);
  }

  debug(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    const logData = {
      message,
      service: service || this.serviceName,
      category,
      ...(context && { context }),
    };

    this.logger.debug(logData, message);
    this.emitLogEvent('debug', message, context, service, category);
  }

  // Convenience methods for specific use cases
  logDatabaseConnection(): void {
    this.info('Connecting to database...', undefined, 'PrismaService');
  }

  logDatabaseConnected(): void {
    this.info('Connected to database', undefined, 'PrismaService');
  }

  logDatabaseDisconnection(): void {
    this.info('Disconnecting from database...', undefined, 'PrismaService');
  }

  logDatabaseDisconnected(): void {
    this.info('Disconnected from database', undefined, 'PrismaService');
  }
}
