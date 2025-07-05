# Logger Service

A comprehensive logging service for the NestJS authentication template that supports structured logging with JSON formatting and multiple log levels.

## Features

- **Multiple Log Levels**: error, warn, info, debug
- **JSON Formatting**: Configurable structured logging in JSON format
- **Colorized Output**: Color-coded log levels for better readability
- **Context Support**: Add contextual data to logs
- **Service Identification**: Tag logs with service names
- **Environment Configuration**: Control logging behavior via environment variables

## Configuration

Add these environment variables to control logging behavior:

```bash
# Log format: 'json' for JSON output, anything else for human-readable format
LOG_FORMAT=json

# Log level: 'error', 'warn', 'info', or 'debug'
LOG_LEVEL=info

# Enable/disable colors (defaults to 'true' if TTY, set to 'false' to disable)
LOG_COLORS=true

# Service name (optional, defaults to 'auth-template')
SERVICE_NAME=auth-template
```

## Usage

### Basic Logging

```typescript
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    this.logger.info('Operation completed successfully');
    this.logger.warn('This is a warning message');
    this.logger.error('An error occurred');
    this.logger.debug('Debug information');
  }
}
```

### Logging with Context

```typescript
// Add structured context data
this.logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

// Add service identification
this.logger.error(
  'Database connection failed',
  {
    error: error.message,
    retryCount: 3,
  },
  'DatabaseService',
);
```

### Convenience Methods

The logger service includes convenience methods for common operations:

```typescript
// Database operations
this.logger.logDatabaseConnection();
this.logger.logDatabaseConnected();
this.logger.logDatabaseDisconnection();
this.logger.logDatabaseDisconnected();

// Application lifecycle
this.logger.logApplicationStart(3000);
this.logger.logSwaggerDocs(3000);

// User operations
this.logger.logUserOperation('User login attempt', { userId: 123 });
```

## Output Formats

### Human-Readable Format (Default)

```
2024-01-15T10:30:45.123Z [INFO] [PrismaService] Connected to database
2024-01-15T10:30:45.124Z [INFO] [UsersController] Current user: - {"user":{"id":1,"email":"user@example.com"}}
```

**With Colors Enabled (in terminal):**

- 🔴 **ERROR**: Red text for error messages
- 🟡 **WARN**: Yellow text for warnings
- 🟢 **INFO**: Green text for info messages
- 🔵 **DEBUG**: Cyan text for debug messages
- 🟣 **Service names**: Magenta text for service identification
- ⚫ **Timestamps**: Dimmed gray for timestamps
- ⚫ **Context**: Gray text for context data

### JSON Format (when LOG_FORMAT=json)

```json
{"timestamp":"2024-01-15T10:30:45.123Z","level":"INFO","message":"Connected to database","service":"PrismaService"}
{"timestamp":"2024-01-15T10:30:45.124Z","level":"INFO","message":"Current user:","context":{"user":{"id":1,"email":"user@example.com"}},"service":"UsersController"}
```

## Log Levels

The logger respects the configured log level and will only output messages at or above the configured level:

- **error**: Only error messages
- **warn**: Error and warning messages
- **info**: Error, warning, and info messages (default)
- **debug**: All messages including debug information

## Color Configuration

Colors are automatically enabled when:

- The output is a terminal (TTY)
- JSON format is not enabled
- `LOG_COLORS` is not set to `'false'`

To disable colors:

```bash
LOG_COLORS=false
```

Colors will automatically be disabled when:

- Redirecting output to files
- Running in non-TTY environments
- Using JSON format

## Integration

The logger service is globally available and automatically injected via the `LoggerModule`. It's already integrated into:

- **PrismaService**: Database connection/disconnection logging
- **Bootstrap**: Application startup logging
- **UsersController**: User operation logging

You can inject it into any service or controller that needs logging capabilities.
