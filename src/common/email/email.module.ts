import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';

// Command Handlers
import {
  SendEmailVerificationHandler,
  SendWelcomeEmailHandler,
  SendPasswordResetHandler,
  SendRfidRegistrationHandler,
  SendApplicationAcceptedHandler,
  SendApplicationRejectedHandler,
  SendProjectApplicationNotificationHandler,
} from './commands';

const CommandHandlers = [
  SendEmailVerificationHandler,
  SendWelcomeEmailHandler,
  SendPasswordResetHandler,
  SendRfidRegistrationHandler,
  SendApplicationAcceptedHandler,
  SendApplicationRejectedHandler,
  SendProjectApplicationNotificationHandler,
];

@Module({
  imports: [
    CqrsModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.getOrThrow('MAIL_HOST'),
          port: configService.get('MAIL_PORT', 587),
          secure: configService.get('MAIL_SECURE', 'false') === 'true',
          auth: {
            user: configService.getOrThrow('MAIL_USER'),
            pass: configService.getOrThrow('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"CSGUILD" <${configService.getOrThrow('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter({
            eq: (a: any, b: any) => a === b,
          }),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService, ...CommandHandlers],
  exports: [EmailService],
})
export class EmailModule {}
