import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PinProjectHandler } from './pin-project.handler';
import { PinProjectCommand } from './pin-project.command';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma';

describe('PinProjectHandler', () => {
  let handler: PinProjectHandler;
  let prismaService: any;

  const mockProject = {
    id: 'project-1',
    slug: 'test-project',
    title: 'Test Project',
    description: 'Test Description',
  };

  const mockPinnedProject = {
    id: 'pinned-1',
    projectSlug: 'test-project',
    pinnedBy: 'admin-user',
    pinnedAt: new Date(),
    order: 1,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      project: {
        findUnique: jest.fn(),
      },
      projectPinned: {
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinProjectHandler,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    handler = module.get<PinProjectHandler>(PinProjectHandler);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const command = new PinProjectCommand('test-project', 'admin-user');

    it('should successfully pin a project', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);
      prismaService.projectPinned.count.mockResolvedValue(3);
      prismaService.projectPinned.aggregate.mockResolvedValue({
        _max: { order: 3 },
      });
      prismaService.projectPinned.create.mockResolvedValue(mockPinnedProject);

      // Act
      await handler.execute(command);

      // Assert
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-project' },
      });
      expect(prismaService.projectPinned.findUnique).toHaveBeenCalledWith({
        where: { projectSlug: 'test-project' },
      });
      expect(prismaService.projectPinned.count).toHaveBeenCalled();
      expect(prismaService.projectPinned.aggregate).toHaveBeenCalledWith({
        _max: { order: true },
      });
      expect(prismaService.projectPinned.create).toHaveBeenCalledWith({
        data: {
          projectSlug: 'test-project',
          pinnedBy: 'admin-user',
          order: 4,
        },
      });
    });

    it('should throw NotFoundException when project does not exist', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException('Project not found'),
      );
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-project' },
      });
    });

    it('should throw ConflictException when project is already pinned', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        mockPinnedProject,
      );

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new ConflictException('Project is already pinned'),
      );
      expect(prismaService.projectPinned.findUnique).toHaveBeenCalledWith({
        where: { projectSlug: 'test-project' },
      });
    });

    it('should throw UnprocessableEntityException when maximum limit reached', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);
      prismaService.projectPinned.count.mockResolvedValue(6);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new UnprocessableEntityException(
          'Maximum limit of 6 pinned projects has been reached',
        ),
      );
      expect(prismaService.projectPinned.count).toHaveBeenCalled();
    });

    it('should handle first pinned project with order 1', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);
      prismaService.projectPinned.count.mockResolvedValue(0);
      prismaService.projectPinned.aggregate.mockResolvedValue({
        _max: { order: null },
      });
      prismaService.projectPinned.create.mockResolvedValue({
        ...mockPinnedProject,
        order: 1,
      });

      // Act
      await handler.execute(command);

      // Assert
      expect(prismaService.projectPinned.create).toHaveBeenCalledWith({
        data: {
          projectSlug: 'test-project',
          pinnedBy: 'admin-user',
          order: 1,
        },
      });
    });

    it('should throw BadRequestException on Prisma error', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);
      prismaService.projectPinned.count.mockResolvedValue(3);
      prismaService.projectPinned.aggregate.mockResolvedValue({
        _max: { order: 3 },
      });

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
        },
      );

      prismaService.projectPinned.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle duplicate constraint error from Prisma', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);
      prismaService.projectPinned.count.mockResolvedValue(3);
      prismaService.projectPinned.aggregate.mockResolvedValue({
        _max: { order: 3 },
      });

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      prismaService.projectPinned.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new ConflictException('Project is already pinned'),
      );
    });
  });
});
