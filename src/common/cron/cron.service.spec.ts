import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { UsersService } from '../../users/users.service';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('CronService', () => {
  let service: CronService;

  const mockUsersService = {
    timeoutAllActiveUsers: jest.fn().mockResolvedValue({ totalTimedOut: 5 }),
  };

  const mockLoggerService = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockPrismaService = {
    projectApplication: {
      findMany: jest.fn(),
    },
  };

  const mockEmailService = {
    sendProjectApplicationNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<CronService>(CronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('timeoutUsersDaily', () => {
    it('should timeout users and log the result', async () => {
      await service.timeoutUsersDaily();

      expect(mockUsersService.timeoutAllActiveUsers).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        '[Daily 8PM] CRON timeout executed: 5 users timed out',
        { totalTimedOut: 5 },
        'CronService',
      );
    });

    it('should handle errors during timeout', async () => {
      const error = new Error('Timeout failed');
      mockUsersService.timeoutAllActiveUsers.mockRejectedValueOnce(error);

      await service.timeoutUsersDaily();

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        '[Daily 8PM] Error during daily user timeout execution',
        error,
        'CronService',
      );
    });
  });

  describe('project application notifications', () => {
    it('should log when no new applications are found', async () => {
      mockPrismaService.projectApplication.findMany.mockResolvedValueOnce([]);

      // Test the private method by calling one of the public cron methods
      await service.notifyProjectOwnersMorning();

      expect(mockPrismaService.projectApplication.findMany).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        expect.stringContaining('No new applications found'),
        {},
        'CronService',
      );
    });

    it('should process and send notifications for new applications', async () => {
      const mockApplications = [
        {
          project: {
            slug: 'test-project',
            title: 'Test Project',
            owner: {
              email: 'owner@test.com',
              firstName: 'Project',
              lastName: 'Owner',
            },
          },
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
          },
          projectRole: {
            role: {
              name: 'Developer',
            },
          },
          message: 'I want to join this project',
          appliedAt: new Date(),
        },
      ];

      mockPrismaService.projectApplication.findMany.mockResolvedValueOnce(
        mockApplications,
      );
      mockEmailService.sendProjectApplicationNotification.mockResolvedValueOnce(
        undefined,
      );

      await service.notifyProjectOwnersMorning();

      expect(
        mockEmailService.sendProjectApplicationNotification,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'owner@test.com',
          firstName: 'Project',
          projects: expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Project',
              slug: 'test-project',
              applicationCount: 1,
            }),
          ]),
          totalApplications: 1,
        }),
      );

      expect(mockLoggerService.info).toHaveBeenCalledWith(
        expect.stringContaining('CRON application notifications executed'),
        expect.objectContaining({
          totalApplications: 1,
          totalNotifiedOwners: 1,
        }),
        'CronService',
      );
    });

    it('should handle email sending errors gracefully', async () => {
      const mockApplications = [
        {
          project: {
            slug: 'test-project',
            title: 'Test Project',
            owner: {
              email: 'owner@test.com',
              firstName: 'Project',
            },
          },
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
          },
          projectRole: {
            role: {
              name: 'Developer',
            },
          },
          message: 'I want to join this project',
          appliedAt: new Date(),
        },
      ];

      const emailError = new Error('Email service failed');
      mockPrismaService.projectApplication.findMany.mockResolvedValueOnce(
        mockApplications,
      );
      mockEmailService.sendProjectApplicationNotification.mockRejectedValueOnce(
        emailError,
      );

      await service.notifyProjectOwnersMorning();

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification'),
        emailError,
        'CronService',
      );
    });
  });
});
