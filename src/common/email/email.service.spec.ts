import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue(true),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config = {
        SUPPORT_EMAIL: 'support@csguild.org',
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailVerification', () => {
    it('should send email verification with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        verificationCode: '123456',
      };

      await service.sendEmailVerification(params);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'CSGUILD - Verify Your Email Address',
        template: 'email-verification',
        context: {
          firstName: 'John',
          verificationCode: '123456',
          organizationName: 'CSGUILD',
          supportEmail: 'support@csguild.org',
        },
      });
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        username: 'john_doe',
      };

      await service.sendWelcomeEmail(params);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Welcome to CSGUILD!',
        template: 'welcome',
        context: {
          firstName: 'John',
          username: 'john_doe',
          organizationName: 'CSGUILD',
          supportEmail: 'support@csguild.org',
          loginUrl: 'http://localhost:3000',
        },
      });
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        resetToken: 'reset-token-123',
      };

      await service.sendPasswordReset(params);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'CSGUILD - Password Reset Request',
        template: 'password-reset',
        context: {
          firstName: 'John',
          organizationName: 'CSGUILD',
          resetUrl:
            'http://localhost:3000/reset-password?token=reset-token-123',
          supportEmail: 'support@csguild.org',
        },
      });
    });
  });

  describe('sendRfidRegistrationSuccess', () => {
    it('should send RFID registration success email with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        rfidId: 'RFID123456',
      };

      await service.sendRfidRegistrationSuccess(params);

      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'CSGUILD - RFID Registration Successful',
        template: 'rfid-registration',
        context: {
          firstName: 'John',
          rfidId: 'RFID123456',
          organizationName: 'CSGUILD',
          supportEmail: 'support@csguild.org',
        },
      });
    });
  });
});
