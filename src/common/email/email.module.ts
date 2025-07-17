import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Services
import { MailgunService } from './mailgun.service';

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
  imports: [CqrsModule],
  providers: [MailgunService, ...CommandHandlers],
  exports: [MailgunService],
})
export class EmailModule {}
