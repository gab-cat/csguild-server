import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  private readonly isJsonFormat: boolean;
  private readonly logLevel: string;
  private readonly serviceName: string;
  private readonly enableColors: boolean;
  private logEmitter: LogEmitter | null = null;

  // ANSI color codes
  private readonly colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  };

  constructor(private readonly configService: ConfigService) {
    this.isJsonFormat = this.configService.get('LOG_FORMAT') === 'json';
    this.logLevel = this.configService.get('LOG_LEVEL') || 'info';
    this.serviceName =
      this.configService.get('SERVICE_NAME') || 'auth-template';
    // Enable colors by default unless explicitly disabled or not a TTY
    this.enableColors =
      this.configService.get('LOG_COLORS') !== 'false' &&
      process.stdout.isTTY &&
      !this.isJsonFormat;
  }

  private getColorForLevel(level: string): string {
    if (!this.enableColors) return '';

    switch (level.toLowerCase()) {
      case 'error':
        return this.colors.red;
      case 'warn':
        return this.colors.yellow;
      case 'info':
        return this.colors.green;
      case 'debug':
        return this.colors.cyan;
      default:
        return this.colors.white;
    }
  }

  setLogEmitter(emitter: LogEmitter): void {
    this.logEmitter = emitter;
  }

  private formatLog(
    level: string,
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): string {
    const timestamp = this.isJsonFormat
      ? new Date().toISOString()
      : new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

    const logEntry: LogEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && { context }),
      ...(service && { service }),
      category,
    };

    // Emit to WebSocket if available
    if (this.logEmitter) {
      this.logEmitter.emit('log', logEntry);
    }

    if (this.isJsonFormat) {
      return JSON.stringify(logEntry);
    } else {
      const color = this.getColorForLevel(level);
      const reset = this.enableColors ? this.colors.reset : '';
      const dimColor = this.enableColors ? this.colors.white : '';
      const brightColor = this.enableColors ? this.colors.bright : '';

      const coloredTimestamp = this.enableColors
        ? `${dimColor}${timestamp}${reset}`
        : timestamp;

      const coloredLevel = this.enableColors
        ? `${color}${brightColor}[${level.toUpperCase()}]${reset}`
        : `[${level.toUpperCase()}]`;

      const coloredService = service
        ? this.enableColors
          ? `${this.colors.magenta}[${service}]${reset} `
          : `[${service}] `
        : '';

      const coloredMessage = this.enableColors
        ? `${color}${message}${reset}`
        : message;

      const contextStr = context
        ? this.enableColors
          ? ` ${this.colors.gray}- ${JSON.stringify(context)}${reset}`
          : ` - ${JSON.stringify(context)}`
        : '';

      return `${coloredTimestamp} ${coloredLevel} ${coloredService}${coloredMessage}${contextStr}`;
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel <= currentLevelIndex;
  }

  error(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    if (this.shouldLog('error')) {
      console.error(
        this.formatLog('error', message, context, service, category),
      );
    }
  }

  warn(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, context, service, category));
    }
  }

  info(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, context, service, category));
    }
  }

  debug(
    message: string,
    context?: LogContext,
    service?: string,
    category: 'service' | 'route' = 'service',
  ): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatLog('debug', message, context, service, category));
    }
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
