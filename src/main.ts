import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { HttpLoggingInterceptor } from './common/logger/http-logging.interceptor';
import { configureSwagger, SERVER, showStartupMessages } from './constants';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://csguild.tech',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setGlobalPrefix('api');
  // Global HTTP logging interceptor
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));

  // Helmet for security headers - completely skip for /logs route
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (
      req.path === '/api/logs' ||
      req.path === '/api/health' ||
      req.path === '/api-docs'
    ) {
      // Skip helmet entirely for log viewer to allow inline event handlers
      return next();
    } else {
      // Apply helmet with strict CSP for all other routes
      return helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            connectSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          },
        },
      })(req, res, next);
    }
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cookie parser for JWT tokens
  app.use(cookieParser());

  configureSwagger(app);

  app.disable('x-powered-by');

  await app.listen(SERVER.PORT);

  showStartupMessages();
}

void bootstrap();
