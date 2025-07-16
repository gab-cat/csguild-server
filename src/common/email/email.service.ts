import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  SendEmailVerificationCommand,
  SendEmailVerificationParams,
  SendWelcomeEmailCommand,
  SendWelcomeEmailParams,
  SendPasswordResetCommand,
  SendPasswordResetParams,
  SendRfidRegistrationCommand,
  SendRfidRegistrationParams,
  SendApplicationAcceptedCommand,
  SendApplicationAcceptedParams,
  SendApplicationRejectedCommand,
  SendApplicationRejectedParams,
  SendProjectApplicationNotificationCommand,
  SendProjectApplicationNotificationParams,
} from './commands';

@Injectable()
export class EmailService {
  constructor(private readonly commandBus: CommandBus) {}

  async sendEmailVerification(
    params: SendEmailVerificationParams,
  ): Promise<void> {
    await this.commandBus.execute(new SendEmailVerificationCommand(params));
  }

  async sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
    await this.commandBus.execute(new SendWelcomeEmailCommand(params));
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    await this.commandBus.execute(new SendPasswordResetCommand(params));
  }

  async sendRfidRegistrationSuccess(
    params: SendRfidRegistrationParams,
  ): Promise<void> {
    await this.commandBus.execute(new SendRfidRegistrationCommand(params));
  }

  async sendApplicationAccepted(
    params: SendApplicationAcceptedParams,
  ): Promise<void> {
    await this.commandBus.execute(new SendApplicationAcceptedCommand(params));
  }

  async sendApplicationRejected(
    params: SendApplicationRejectedParams,
  ): Promise<void> {
    await this.commandBus.execute(new SendApplicationRejectedCommand(params));
  }

  async sendProjectApplicationNotification(
    params: SendProjectApplicationNotificationParams,
  ): Promise<void> {
    await this.commandBus.execute(
      new SendProjectApplicationNotificationCommand(params),
    );
  }
}
