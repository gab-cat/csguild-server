/* eslint-disable max-len */
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SERVER = {
  PORT: 3000,
  API_DOCS_PATH: 'api-docs',
} as const;

export const API_INFO = {
  TITLE: 'NestJS Authentication API',
  VERSION: '1.0.0',
  DESCRIPTION: `A comprehensive NestJS authentication API with PostgreSQL & Prisma.

### Features
- JWT Authentication with Access & Refresh tokens
- Google OAuth2 integration
- Local authentication (email/password)
- Cookie-based token storage
- Protected routes with guards

### Authentication
This API uses JWT tokens stored in HTTP-only cookies for authentication.

1. Local Authentication
2. Google OAuth`,
} as const;

export const SWAGGER_TAGS = {
  AUTHENTICATION: {
    name: 'Authentication',
    description: 'Authentication and authorization endpoints',
  },
  USERS: {
    name: 'Users',
    description: 'User management endpoints',
  },
} as const;

export const COOKIE_AUTH = {
  AUTHENTICATION: {
    name: 'Authentication',
    config: {
      type: 'http' as const,
      in: 'cookie' as const,
      scheme: 'bearer' as const,
      bearerFormat: 'JWT',
      description: 'JWT access token stored in HTTP-only cookie',
    },
  },
  REFRESH: {
    name: 'Refresh',
    config: {
      type: 'http' as const,
      in: 'cookie' as const,
      scheme: 'bearer' as const,
      bearerFormat: 'JWT',
      description: 'JWT refresh token stored in HTTP-only cookie',
    },
  },
} as const;

export const RATE_LIMITING = {
  FAILED_LOGIN: {
    MAX_ATTEMPTS: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    BLOCK_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  },
  THROTTLE: {
    DEFAULT: {
      TTL: 60000, // 1 minute
      LIMIT: 10, // 10 requests per minute
    },
    LOGIN_ATTEMPTS: {
      TTL: 900000, // 15 minutes
      LIMIT: 5, // 5 failed attempts per 15 minutes
    },
  },
} as const;

export const SWAGGER_OPTIONS = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    theme: 'dark',
    syntaxHighlight: {
      theme: 'monokai',
    },
    tryItOutEnabled: true,
  },
  customCss: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&' +
      'family=JetBrains+Mono:wght@400;500;600&display=swap');
  `,
  customCssUrl: '/swagger-dark-theme.css',
  customJsUrl: '/swagger-custom.js',
} as const;

export const CONSOLE_MESSAGES = {
  SEPARATOR:
    '\no==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o\n',
  APP_NAME: '🚀  NestJS Authentication API',
  VERSION_LABEL: 'Version    : 1.0.0',
  DESCRIPTION_LABEL:
    'Description: A comprehensive NestJS authentication API with PostgreSQL & Prisma',
  STATUS_BOX: {
    TOP: '  ┌─ 🚀 SERVER STATUS ────────────────────────────────────────────────────┐',
    EMPTY:
      '  │                                                                       │',
    SERVER_RUNNING: (port: number) =>
      `  │  ✅ Server running on: http://localhost:${port}                          │`,
    API_DOCS: (port: number, path: string) =>
      `  │  📚 API Documentation: http://localhost:${port}/${path}                 │`,
    LOG_VIEWER: (port: number, path: string) =>
      `  │  🔍 Log Viewer: http://localhost:${port}/${path}                            │`,
    BOTTOM:
      '  └───────────────────────────────────────────────────────────────────────┘',
  },
  READY_MESSAGE: `  💡 Server is ready to start! Please check the documentation at /${SERVER.API_DOCS_PATH}`,
  FOOTER:
    '\no==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o==o\n',
} as const;

/**
 * Configure Swagger documentation
 */
export function configureSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(API_INFO.TITLE)
    .setDescription(API_INFO.DESCRIPTION)
    .setVersion(API_INFO.VERSION)
    .addTag('App', 'Application endpoints')
    .addTag(
      SWAGGER_TAGS.AUTHENTICATION.name,
      SWAGGER_TAGS.AUTHENTICATION.description,
    )
    .addTag(SWAGGER_TAGS.USERS.name, SWAGGER_TAGS.USERS.description)
    .addCookieAuth(
      COOKIE_AUTH.AUTHENTICATION.name,
      COOKIE_AUTH.AUTHENTICATION.config,
    )
    .addCookieAuth(COOKIE_AUTH.REFRESH.name, COOKIE_AUTH.REFRESH.config)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SERVER.API_DOCS_PATH, app, document, SWAGGER_OPTIONS);
}

/**
 * Start the server and display startup messages
 */
export async function showStartupMessages(): Promise<void> {
  // Display startup messages
  console.log(CONSOLE_MESSAGES.SEPARATOR);
  console.log(CONSOLE_MESSAGES.APP_NAME);
  console.log(CONSOLE_MESSAGES.VERSION_LABEL);
  console.log(CONSOLE_MESSAGES.DESCRIPTION_LABEL);
  console.log('\n');
  console.log(CONSOLE_MESSAGES.STATUS_BOX.TOP);
  console.log(CONSOLE_MESSAGES.STATUS_BOX.EMPTY);
  console.log(CONSOLE_MESSAGES.STATUS_BOX.SERVER_RUNNING(SERVER.PORT));
  console.log(
    CONSOLE_MESSAGES.STATUS_BOX.API_DOCS(SERVER.PORT, SERVER.API_DOCS_PATH),
  );
  console.log(CONSOLE_MESSAGES.STATUS_BOX.LOG_VIEWER(SERVER.PORT, 'logs'));
  console.log(CONSOLE_MESSAGES.STATUS_BOX.EMPTY);
  console.log(CONSOLE_MESSAGES.STATUS_BOX.BOTTOM);
  console.log('\n');
  console.log(CONSOLE_MESSAGES.READY_MESSAGE);
  console.log(CONSOLE_MESSAGES.FOOTER);
}
