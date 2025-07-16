import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { EmailService } from './email.service';
import {
  SendEmailVerificationCommand,
  SendWelcomeEmailCommand,
  SendPasswordResetCommand,
  SendRfidRegistrationCommand,
} from './commands';

describe('EmailService', () => {
  let service: EmailService;
  let commandBus: CommandBus;

  const mockCommandBus = {
    execute: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    commandBus = module.get<CommandBus>(CommandBus);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailVerification', () => {
    it('should execute SendEmailVerificationCommand with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        verificationCode: '123456',
      };

      await service.sendEmailVerification(params);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new SendEmailVerificationCommand(params),
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should execute SendWelcomeEmailCommand with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        username: 'john_doe',
      };

      await service.sendWelcomeEmail(params);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new SendWelcomeEmailCommand(params),
      );
    });
  });

  describe('sendPasswordReset', () => {
    it('should execute SendPasswordResetCommand with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        resetToken: 'reset-token-123',
      };

      await service.sendPasswordReset(params);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new SendPasswordResetCommand(params),
      );
    });
  });

  describe('sendRfidRegistrationSuccess', () => {
    it('should execute SendRfidRegistrationCommand with correct parameters', async () => {
      const params = {
        email: 'test@example.com',
        firstName: 'John',
        rfidId: 'RFID123456',
      };

      await service.sendRfidRegistrationSuccess(params);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new SendRfidRegistrationCommand(params),
      );
    });
  });
});
