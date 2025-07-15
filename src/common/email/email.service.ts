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

interface SendApplicationAcceptedParams {
  email: string;
  firstName: string;
  projectName: string;
  roleName: string;
  reviewMessage?: string;
}

interface SendApplicationRejectedParams {
  email: string;
  firstName: string;
  projectName: string;
  roleName: string;
  reviewMessage?: string;
}

interface SendProjectApplicationNotificationParams {
  email: string;
  firstName: string;
  projects: {
    name: string;
    slug: string;
    applicationCount: number;
    applications: {
      applicantName: string;
      applicantEmail: string;
      roleName: string;
      message: string;
      appliedAt: Date;
    }[];
  }[];
  totalApplications: number;
  timeWindow: string;
  schedule: string;
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
        )}/reset-password?token=${encodeURIComponent(resetToken)}`,
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

  async sendApplicationAccepted(
    params: SendApplicationAcceptedParams,
  ): Promise<void> {
    const { email, firstName, projectName, roleName, reviewMessage } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: `CSGUILD - Application Accepted for ${projectName}`,
      template: 'application-accepted',
      context: {
        firstName,
        projectName,
        roleName,
        reviewMessage,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        projectUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/projects/${encodeURIComponent(
          projectName.toLowerCase().replace(/\s+/g, '-'),
        )}`,
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
      },
    });
  }

  async sendApplicationRejected(
    params: SendApplicationRejectedParams,
  ): Promise<void> {
    const { email, firstName, projectName, roleName, reviewMessage } = params;

    await this.mailerService.sendMail({
      to: email,
      subject: `CSGUILD - Application Update for ${projectName}`,
      template: 'application-rejected',
      context: {
        firstName,
        projectName,
        roleName,
        reviewMessage,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        projectsUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/projects`,
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
      },
    });
  }

  async sendProjectApplicationNotification(
    params: SendProjectApplicationNotificationParams,
  ): Promise<void> {
    const {
      email,
      firstName,
      projects,
      totalApplications,
      timeWindow,
      schedule,
    } = params;

    const subjectText = totalApplications !== 1 ? 's' : '';
    const projectText = projects.length !== 1 ? 's' : '';

    await this.mailerService.sendMail({
      to: email,
      subject: `CSGUILD - ${totalApplications} New Application${subjectText} to Your Project${projectText}`,
      template: 'project-application-notification',
      context: {
        firstName,
        projects,
        totalApplications,
        timeWindow,
        schedule,
        hasMultipleProjects: projects.length > 1,
        organizationName: 'CSGUILD',
        supportEmail: this.configService.get(
          'SUPPORT_EMAIL',
          'support@csguild.org',
        ),
        dashboardUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/dashboard`,
        projectsUrl: `${this.configService.get(
          'FRONTEND_URL',
          'http://localhost:3000',
        )}/my-projects`,
      },
    });
  }
}
