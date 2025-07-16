import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UnpinProjectHandler } from './unpin-project.handler';
import { UnpinProjectCommand } from './unpin-project.command';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Prisma } from '../../../../generated/prisma';

describe('UnpinProjectHandler', () => {
  let handler: UnpinProjectHandler;
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
    order: 2,
  };

  beforeEach(async () => {
    const mockPrismaService = {
      project: {
        findUnique: jest.fn(),
      },
      projectPinned: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnpinProjectHandler,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    handler = module.get<UnpinProjectHandler>(UnpinProjectHandler);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    const command = new UnpinProjectCommand('test-project', 'admin-user');

    it('should successfully unpin a project', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        mockPinnedProject,
      );

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        const mockTx = {
          projectPinned: {
            delete: jest.fn(),
            updateMany: jest.fn(),
          },
        };
        return await callback(mockTx);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      await handler.execute(command);

      // Assert
      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-project' },
      });
      expect(prismaService.projectPinned.findUnique).toHaveBeenCalledWith({
        where: { projectSlug: 'test-project' },
      });
      expect(prismaService.$transaction).toHaveBeenCalled();
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

    it('should throw NotFoundException when project is not pinned', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException('Project is not currently pinned'),
      );
      expect(prismaService.projectPinned.findUnique).toHaveBeenCalledWith({
        where: { projectSlug: 'test-project' },
      });
    });

    it('should adjust order of remaining projects after unpinning', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        mockPinnedProject,
      );

      const mockTx = {
        projectPinned: {
          delete: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      await handler.execute(command);

      // Assert
      expect(mockTransaction).toHaveBeenCalled();

      // Verify the transaction callback was called with correct operations
      const transactionCallback = mockTransaction.mock.calls[0][0];
      await transactionCallback(mockTx);

      expect(mockTx.projectPinned.delete).toHaveBeenCalledWith({
        where: { projectSlug: 'test-project' },
      });
      expect(mockTx.projectPinned.updateMany).toHaveBeenCalledWith({
        where: {
          order: {
            gt: 2,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    });

    it('should throw BadRequestException on Prisma error', async () => {
      // Arrange
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        mockPinnedProject,
      );

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Database error',
        {
          code: 'P2001',
          clientVersion: '5.0.0',
        },
      );

      prismaService.$transaction.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle unpinning project with order 1', async () => {
      // Arrange
      const firstPinnedProject = { ...mockPinnedProject, order: 1 };
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        firstPinnedProject,
      );

      const mockTx = {
        projectPinned: {
          delete: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      await handler.execute(command);

      // Assert
      const transactionCallback = mockTransaction.mock.calls[0][0];
      await transactionCallback(mockTx);

      expect(mockTx.projectPinned.updateMany).toHaveBeenCalledWith({
        where: {
          order: {
            gt: 1,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    });

    it('should handle unpinning last project (order 6)', async () => {
      // Arrange
      const lastPinnedProject = { ...mockPinnedProject, order: 6 };
      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectPinned.findUnique.mockResolvedValue(
        lastPinnedProject,
      );

      const mockTx = {
        projectPinned: {
          delete: jest.fn(),
          updateMany: jest.fn(),
        },
      };

      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      prismaService.$transaction.mockImplementation(mockTransaction);

      // Act
      await handler.execute(command);

      // Assert
      const transactionCallback = mockTransaction.mock.calls[0][0];
      await transactionCallback(mockTx);

      // When unpinning the last project, no other projects need order adjustment
      expect(mockTx.projectPinned.updateMany).toHaveBeenCalledWith({
        where: {
          order: {
            gt: 6,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    });
  });
});
