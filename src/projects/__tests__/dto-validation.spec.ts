import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  CreateProjectDto,
  CreateProjectRoleDto,
  JoinProjectDto,
  ReviewApplicationDto,
} from '../dto';

describe('Projects DTOs Validation', () => {
  describe('CreateProjectDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'CS Guild Mobile App',
        description:
          'A mobile application for the CS Guild community with features for collaboration.',
        tags: ['mobile', 'react-native', 'typescript'],
        dueDate: '2024-12-31T23:59:59.000Z',
        roles: [
          {
            roleId: '550e8400-e29b-41d4-a716-446655440000',
            maxMembers: 2,
            requirements: 'Experience with React Native required',
          },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToClass(CreateProjectDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);

      const errorConstraints = errors.flatMap((error) =>
        Object.keys(error.constraints || {}),
      );
      expect(errorConstraints).toContain('isNotEmpty');
    });

    it('should fail validation with title too short', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'CS',
        description:
          'A mobile application for the CS Guild community with features for collaboration.',
        tags: ['mobile'],
        roles: [
          {
            roleId: '550e8400-e29b-41d4-a716-446655440000',
            maxMembers: 2,
          },
        ],
      });

      const errors = await validate(dto);
      const titleError = errors.find((error) => error.property === 'title');
      expect(titleError?.constraints?.minLength).toBeDefined();
    });

    it('should fail validation with description too short', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'CS Guild Mobile App',
        description: 'Short',
        tags: ['mobile'],
        roles: [
          {
            roleId: 'clm7x8k9e0000v8og4n2h5k7s',
          },
        ],
      });

      const errors = await validate(dto);
      const descriptionError = errors.find(
        (error) => error.property === 'description',
      );
      expect(descriptionError?.constraints?.minLength).toBeDefined();
    });

    it('should fail validation with too many tags', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'CS Guild Mobile App',
        description:
          'A mobile application for the CS Guild community with features for collaboration.',
        tags: Array(15).fill('tag'), // More than maxItems: 10
        roles: [
          {
            roleId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
      });

      const errors = await validate(dto);
      const tagsError = errors.find((error) => error.property === 'tags');
      expect(tagsError?.constraints?.arrayMaxSize).toBeDefined();
    });

    it('should transform tags to lowercase and filter empty ones', async () => {
      const dto = plainToClass(CreateProjectDto, {
        title: 'CS Guild Mobile App',
        description:
          'A mobile application for the CS Guild community with features for collaboration.',
        tags: ['MOBILE', 'React-Native', '', '  ', 'TypeScript'],
        roles: [
          {
            roleId: '550e8400-e29b-41d4-a716-446655440000',
          },
        ],
      });

      expect(dto.tags).toEqual(['mobile', 'react-native', 'typescript']);
    });
  });

  describe('CreateProjectRoleDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateProjectRoleDto, {
        roleId: '550e8400-e29b-41d4-a716-446655440000',
        maxMembers: 2,
        requirements: 'Experience with React Native required',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid UUID', async () => {
      const dto = plainToClass(CreateProjectRoleDto, {
        roleId: 'invalid-uuid',
        maxMembers: 2,
      });

      const errors = await validate(dto);
      const roleIdError = errors.find((error) => error.property === 'roleId');
      expect(roleIdError?.constraints?.isUuid).toBeDefined();
    });

    it('should fail validation with maxMembers below minimum', async () => {
      const dto = plainToClass(CreateProjectRoleDto, {
        roleId: '550e8400-e29b-41d4-a716-446655440000',
        maxMembers: 0,
      });

      const errors = await validate(dto);
      const maxMembersError = errors.find(
        (error) => error.property === 'maxMembers',
      );
      expect(maxMembersError?.constraints?.min).toBeDefined();
    });

    it('should fail validation with maxMembers above maximum', async () => {
      const dto = plainToClass(CreateProjectRoleDto, {
        roleId: '550e8400-e29b-41d4-a716-446655440000',
        maxMembers: 100,
      });

      const errors = await validate(dto);
      const maxMembersError = errors.find(
        (error) => error.property === 'maxMembers',
      );
      expect(maxMembersError?.constraints?.max).toBeDefined();
    });
  });

  describe('JoinProjectDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(JoinProjectDto, {
        projectId: 'clm7x8k9e0000v8og4n2h5k7s',
        projectRoleId: 'clm7x8k9e0000v8og4n2h5k7t',
        message:
          'I have experience with React Native and would love to contribute.',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid project ID', async () => {
      const dto = plainToClass(JoinProjectDto, {
        projectId: 'invalid-uuid',
        projectRoleId: 'clm7x8k9e0000v8og4n2h5k7t',
      });

      const errors = await validate(dto);
      const projectIdError = errors.find(
        (error) => error.property === 'projectId',
      );
      expect(projectIdError?.constraints?.isUuid).toBeDefined();
    });

    it('should fail validation with message too long', async () => {
      const dto = plainToClass(JoinProjectDto, {
        projectId: 'clm7x8k9e0000v8og4n2h5k7s',
        projectRoleId: 'clm7x8k9e0000v8og4n2h5k7t',
        message: 'a'.repeat(1001), // More than maxLength: 1000
      });

      const errors = await validate(dto);
      const messageError = errors.find((error) => error.property === 'message');
      expect(messageError?.constraints?.maxLength).toBeDefined();
    });
  });

  describe('ReviewApplicationDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(ReviewApplicationDto, {
        applicationId: 'clm7x8k9e0000v8og4n2h5k7s',
        decision: 'APPROVED',
        reviewMessage: 'Welcome to the team!',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid decision', async () => {
      const dto = plainToClass(ReviewApplicationDto, {
        applicationId: 'clm7x8k9e0000v8og4n2h5k7s',
        decision: 'INVALID_DECISION',
      });

      const errors = await validate(dto);
      const decisionError = errors.find(
        (error) => error.property === 'decision',
      );
      expect(decisionError?.constraints?.isEnum).toBeDefined();
    });

    it('should fail validation with review message too long', async () => {
      const dto = plainToClass(ReviewApplicationDto, {
        applicationId: 'clm7x8k9e0000v8og4n2h5k7s',
        decision: 'APPROVED',
        reviewMessage: 'a'.repeat(501), // More than maxLength: 500
      });

      const errors = await validate(dto);
      const reviewMessageError = errors.find(
        (error) => error.property === 'reviewMessage',
      );
      expect(reviewMessageError?.constraints?.maxLength).toBeDefined();
    });
  });
});
