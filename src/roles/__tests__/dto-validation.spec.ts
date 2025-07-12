import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

describe('Role DTOs Validation', () => {
  describe('CreateRoleDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: 'Frontend Developer',
        description: 'Responsible for building user interfaces',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with custom slug', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: 'UI/UX Designer',
        slug: 'ui-ux-designer',
        description: 'Creates user interfaces and user experience designs',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty name', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: '',
        description: 'Some description',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with invalid slug format', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: 'Frontend Developer',
        slug: 'invalid slug!',
        description: 'Some description',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('slug');
    });

    it('should fail validation with too long name', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: 'a'.repeat(101),
        description: 'Some description',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('should fail validation with too long description', async () => {
      const dto = plainToClass(CreateRoleDto, {
        name: 'Frontend Developer',
        description: 'a'.repeat(501),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('description');
    });
  });

  describe('UpdateRoleDto', () => {
    it('should pass validation with partial data', async () => {
      const dto = plainToClass(UpdateRoleDto, {
        name: 'Senior Frontend Developer',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with all fields', async () => {
      const dto = plainToClass(UpdateRoleDto, {
        name: 'Senior Frontend Developer',
        slug: 'senior-frontend-developer',
        description: 'Lead frontend development initiatives',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const dto = plainToClass(UpdateRoleDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid slug format', async () => {
      const dto = plainToClass(UpdateRoleDto, {
        slug: 'invalid slug!',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('slug');
    });

    it('should fail validation with too short name', async () => {
      const dto = plainToClass(UpdateRoleDto, {
        name: 'a',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });
  });
});
