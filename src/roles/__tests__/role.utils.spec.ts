import { Test, TestingModule } from '@nestjs/testing';
import { RoleUtils } from '../utils/role.utils';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('RoleUtils', () => {
  let roleUtils: RoleUtils;

  const mockPrismaService = {
    userRole: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    projectRole: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleUtils,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    roleUtils = module.get<RoleUtils>(RoleUtils);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateSlug', () => {
    it('should generate a slug from role name', () => {
      expect(RoleUtils.generateSlug('Frontend Developer')).toBe(
        'frontend-developer',
      );
      expect(RoleUtils.generateSlug('UI/UX Designer')).toBe('ui-ux-designer');
      expect(RoleUtils.generateSlug('Backend Engineer')).toBe(
        'backend-engineer',
      );
      expect(RoleUtils.generateSlug('Project Manager')).toBe('project-manager');
    });

    it('should handle special characters and multiple spaces', () => {
      expect(RoleUtils.generateSlug('Full-Stack   Developer!!!')).toBe(
        'full-stack-developer',
      );
      expect(RoleUtils.generateSlug('@DevOps Engineer#')).toBe(
        'devops-engineer',
      );
      expect(RoleUtils.generateSlug('   Senior Developer   ')).toBe(
        'senior-developer',
      );
    });
  });

  describe('getRoleById', () => {
    it('should return role by ID', async () => {
      const mockRole = {
        id: 'role-id',
        name: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Responsible for building user interfaces',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);

      const result = await roleUtils.getRoleById('role-id');

      expect(result).toEqual(mockRole);
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { id: 'role-id' },
      });
    });
  });

  describe('getRoleBySlug', () => {
    it('should return role by slug', async () => {
      const mockRole = {
        id: 'role-id',
        name: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Responsible for building user interfaces',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.userRole.findUnique.mockResolvedValue(mockRole);

      const result = await roleUtils.getRoleBySlug('frontend-developer');

      expect(result).toEqual(mockRole);
      expect(mockPrismaService.userRole.findUnique).toHaveBeenCalledWith({
        where: { slug: 'frontend-developer' },
      });
    });
  });

  describe('checkRoleExists', () => {
    it('should return false when no role exists', async () => {
      mockPrismaService.userRole.findFirst.mockResolvedValue(null);

      const result = await roleUtils.checkRoleExists('New Role', 'new-role');

      expect(result).toEqual({ exists: false });
    });

    it('should return true with conflict field when role name exists', async () => {
      const existingRole = {
        id: 'existing-id',
        name: 'Frontend Developer',
        slug: 'frontend-developer',
      };

      mockPrismaService.userRole.findFirst.mockResolvedValue(existingRole);

      const result = await roleUtils.checkRoleExists(
        'Frontend Developer',
        'different-slug',
      );

      expect(result).toEqual({ exists: true, conflictField: 'name' });
    });

    it('should return true with conflict field when role slug exists', async () => {
      const existingRole = {
        id: 'existing-id',
        name: 'Different Name',
        slug: 'frontend-developer',
      };

      mockPrismaService.userRole.findFirst.mockResolvedValue(existingRole);

      const result = await roleUtils.checkRoleExists(
        'Different Name 2',
        'frontend-developer',
      );

      expect(result).toEqual({ exists: true, conflictField: 'slug' });
    });

    it('should exclude specified role ID from check', async () => {
      mockPrismaService.userRole.findFirst.mockResolvedValue(null);

      await roleUtils.checkRoleExists(
        'Frontend Developer',
        'frontend-developer',
        'exclude-id',
      );

      expect(mockPrismaService.userRole.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ name: 'Frontend Developer' }, { slug: 'frontend-developer' }],
          AND: [{ id: { not: 'exclude-id' } }],
        },
      });
    });
  });

  describe('getRoleUsageCount', () => {
    it('should return user and project counts', async () => {
      mockPrismaService.user.count.mockResolvedValue(5);
      mockPrismaService.projectRole.count.mockResolvedValue(3);

      const result = await roleUtils.getRoleUsageCount('role-id');

      expect(result).toEqual({ userCount: 5, projectCount: 3 });
      expect(mockPrismaService.user.count).toHaveBeenCalledWith({
        where: { userRoles: { some: { id: 'role-id' } } },
      });
      expect(mockPrismaService.projectRole.count).toHaveBeenCalledWith({
        where: { roleId: 'role-id' },
      });
    });
  });

  describe('canDeleteRole', () => {
    it('should return true when role can be deleted', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.projectRole.count.mockResolvedValue(0);

      const result = await roleUtils.canDeleteRole('role-id');

      expect(result).toEqual({ canDelete: true });
    });

    it('should return false when role has users', async () => {
      mockPrismaService.user.count.mockResolvedValue(3);
      mockPrismaService.projectRole.count.mockResolvedValue(0);

      const result = await roleUtils.canDeleteRole('role-id');

      expect(result).toEqual({
        canDelete: false,
        reason: 'Role is assigned to 3 user(s)',
      });
    });

    it('should return false when role has projects', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.projectRole.count.mockResolvedValue(2);

      const result = await roleUtils.canDeleteRole('role-id');

      expect(result).toEqual({
        canDelete: false,
        reason: 'Role is used in 2 project(s)',
      });
    });
  });
});
