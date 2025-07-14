import { Test, TestingModule } from '@nestjs/testing';
import { RemoveProjectMemberHandler } from './remove-project-member.handler';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RemoveProjectMemberCommand } from './remove-project-member.command';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { MemberStatus } from '../../../../generated/prisma';

describe('RemoveProjectMemberHandler', () => {
  let handler: RemoveProjectMemberHandler;
  let prismaService: {
    project: {
      findUnique: jest.Mock;
    };
    projectMember: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockProject = {
    id: 'project-id',
    slug: 'test-project',
    title: 'Test Project',
    ownerSlug: 'owner-user',
  };

  const mockProjectMember = {
    id: 'member-id',
    projectSlug: 'test-project',
    userSlug: 'member-user',
    roleSlug: 'developer',
    status: MemberStatus.ACTIVE,
    user: {
      username: 'member-user',
      firstName: 'John',
      lastName: 'Doe',
    },
    projectRole: {
      role: {
        name: 'Developer',
        slug: 'developer',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProjectMemberHandler,
        {
          provide: PrismaService,
          useValue: {
            project: {
              findUnique: jest.fn(),
            },
            projectMember: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    handler = module.get<RemoveProjectMemberHandler>(
      RemoveProjectMemberHandler,
    );
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should remove a project member successfully', async () => {
      const command = new RemoveProjectMemberCommand(
        'test-project',
        'member-user',
        'owner-user',
      );

      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectMember.findFirst.mockResolvedValue(
        mockProjectMember,
      );
      prismaService.projectMember.update.mockResolvedValue({
        ...mockProjectMember,
        status: MemberStatus.REMOVED,
      });

      await handler.execute(command);

      expect(prismaService.project.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-project' },
        select: {
          id: true,
          slug: true,
          title: true,
          ownerSlug: true,
        },
      });

      expect(prismaService.projectMember.findFirst).toHaveBeenCalledWith({
        where: {
          projectSlug: 'test-project',
          userSlug: 'member-user',
          status: MemberStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          projectRole: {
            include: {
              role: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      expect(prismaService.projectMember.update).toHaveBeenCalledWith({
        where: {
          id: 'member-id',
        },
        data: {
          status: MemberStatus.REMOVED,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException when project not found', async () => {
      const command = new RemoveProjectMemberCommand(
        'non-existent-project',
        'member-user',
        'owner-user',
      );

      prismaService.project.findUnique.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException(
          "Project with slug 'non-existent-project' not found",
        ),
      );
    });

    it('should throw ForbiddenException when requestor is not the owner', async () => {
      const command = new RemoveProjectMemberCommand(
        'test-project',
        'member-user',
        'non-owner-user',
      );

      prismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(handler.execute(command)).rejects.toThrow(
        new ForbiddenException(
          'Only the project owner can remove project members',
        ),
      );
    });

    it('should throw NotFoundException when member not found', async () => {
      const command = new RemoveProjectMemberCommand(
        'test-project',
        'non-existent-member',
        'owner-user',
      );

      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectMember.findFirst.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        new NotFoundException(
          "Active member with username 'non-existent-member' not found in project 'test-project'",
        ),
      );
    });

    it('should throw BadRequestException when owner tries to remove themselves', async () => {
      const command = new RemoveProjectMemberCommand(
        'test-project',
        'owner-user',
        'owner-user',
      );

      prismaService.project.findUnique.mockResolvedValue(mockProject);
      prismaService.projectMember.findFirst.mockResolvedValue({
        ...mockProjectMember,
        userSlug: 'owner-user',
      });

      await expect(handler.execute(command)).rejects.toThrow(
        new BadRequestException(
          'Project owner cannot remove themselves from the project',
        ),
      );
    });
  });
});
