import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

interface SendEmailVerificationParams {
  email: string;
  firstName: string;
  verificationCode: string;
}

interface SendWelcomeEmailParams {
  email: string;
  firstName: string;
  username: string;
}

interface SendPasswordResetParams {
  email: string;
  firstName: string;
  resetToken: string;
}

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmailVerification(
    params: SendEmailVerificationParams,
  ): Promise<void> {
    const { email, firstName, verificationCode } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'CSGUILD - Verify Your Email Address',
      template: 'email-verification',
      context: {
        firstName,
        verificationCode,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }

  async sendWelcomeEmail(params: SendWelcomeEmailParams): Promise<void> {
    const { email, firstName, username } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to CSGUILD!',
      template: 'welcome',
      context: {
        firstName,
        username,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        loginUrl: this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        ),
      },
    });
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const { email, firstName, resetToken } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'CSGUILD - Password Reset Request',
      template: 'password-reset',
      context: {
        firstName,
        organizationName: 'CSGUILD',
        resetUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/reset-password?token=${resetToken}`,
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }

  async sendRfidRegistrationSuccess(params: {
    email: string;
    firstName: string;
    rfidId: string;
  }): Promise<void> {
    const { email, firstName, rfidId } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: 'CSGUILD - RFID Registration Successful',
      template: 'rfid-registration',
      context: {
        firstName,
        rfidId,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
      },
    });
  }
}
