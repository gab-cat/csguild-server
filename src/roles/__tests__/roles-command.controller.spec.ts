import { Test, TestingModule } from '@nestjs/testing';
import { RolesCommandController } from '../roles-command.controller';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreateRoleResponseDto,
  UpdateRoleResponseDto,
} from '../dto';

describe('RolesCommandController', () => {
  let controller: RolesCommandController;

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesCommandController],
      providers: [
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<RolesCommandController>(RolesCommandController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'Frontend Developer',
        description: 'Responsible for building user interfaces',
      };

      const expectedRole = {
        id: 'role-id',
        name: 'Frontend Developer',
        slug: 'frontend-developer',
        description: 'Responsible for building user interfaces',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResponse: CreateRoleResponseDto = {
        message: 'Role created successfully',
        statusCode: 201,
        role: expectedRole,
      };

      mockCommandBus.execute.mockResolvedValue(expectedRole);

      const actualResult = await controller.create(createRoleDto);

      expect(actualResult).toEqual(expectedResponse);
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const roleId = 'role-id';
      const updateRoleDto: UpdateRoleDto = {
        name: 'Senior Frontend Developer',
        description: 'Lead frontend development initiatives',
      };

      const expectedRole = {
        id: roleId,
        name: 'Senior Frontend Developer',
        slug: 'senior-frontend-developer',
        description: 'Lead frontend development initiatives',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedResponse: UpdateRoleResponseDto = {
        message: 'Role updated successfully',
        statusCode: 200,
        role: expectedRole,
      };

      mockCommandBus.execute.mockResolvedValue(expectedRole);

      const actualResult = await controller.update(roleId, updateRoleDto);

      expect(actualResult).toEqual(expectedResponse);
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should delete a role successfully', async () => {
      const roleId = 'role-id';

      mockCommandBus.execute.mockResolvedValue(undefined);

      const actualResult = await controller.remove(roleId);

      expect(actualResult).toEqual({ message: 'Role deleted successfully' });
      expect(mockCommandBus.execute).toHaveBeenCalledTimes(1);
    });
  });
});
