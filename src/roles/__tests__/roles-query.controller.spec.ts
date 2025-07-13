import { Test, TestingModule } from '@nestjs/testing';
import { RolesQueryController } from '../roles-query.controller';
import { QueryBus } from '@nestjs/cqrs';
import { RoleListResponseDto, RoleResponseDto } from '../dto';

describe('RolesQueryController', () => {
  let controller: RolesQueryController;

  const mockQueryBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesQueryController],
      providers: [
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<RolesQueryController>(RolesQueryController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated roles', async () => {
      const expectedResponse: RoleListResponseDto = {
        message: 'Roles retrieved successfully',
        statusCode: 200,
        data: [
          {
            id: 'role-id',
            name: 'Frontend Developer',
            slug: 'frontend-developer',
            description: 'Responsible for building user interfaces',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockQueryBus.execute.mockResolvedValue(expectedResponse);

      const actualResult = await controller.findAll();

      expect(actualResult).toEqual(expectedResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle search and pagination parameters', async () => {
      const search = 'frontend';
      const page = 2;
      const limit = 5;
      const sortBy = 'name';
      const sortOrder = 'asc';

      const expectedResponse: RoleListResponseDto = {
        message: 'Roles retrieved successfully',
        statusCode: 200,
        data: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      };

      mockQueryBus.execute.mockResolvedValue(expectedResponse);

      const actualResult = await controller.findAll(
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      );

      expect(actualResult).toEqual(expectedResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { search },
          pagination: {
            page: 2,
            limit: 5,
            sortBy: 'name',
            sortOrder: 'asc',
          },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a role by ID', async () => {
      const roleId = 'role-id';
      const expectedRole: RoleResponseDto = {
        id: roleId,
        name: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Responsible for building user interfaces',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQueryBus.execute.mockResolvedValueOnce(expectedRole);

      const actualResult = await controller.findById(roleId);

      expect(actualResult).toEqual(expectedRole);
      expect(mockQueryBus.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('findBySlug', () => {
    it('should return a role by slug', async () => {
      const slug = 'frontend-developer';
      const expectedRole: RoleResponseDto = {
        id: 'role-id',
        name: 'Frontend Developer',
        slug: slug,
        description: 'Responsible for building user interfaces',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockQueryBus.execute.mockResolvedValueOnce(expectedRole);

      const actualResult = await controller.findBySlug(slug);

      expect(actualResult).toEqual(expectedRole);
      expect(mockQueryBus.execute).toHaveBeenCalledTimes(1);
    });
  });
});
