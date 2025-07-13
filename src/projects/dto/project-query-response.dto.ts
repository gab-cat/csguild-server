import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../../generated/prisma';

export class ProjectOwnerDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  imageUrl?: string;
}

export class ProjectRoleDto {
  @ApiProperty({ example: 'frontend-developer' })
  roleSlug: string;

  @ApiProperty({ example: 2 })
  maxMembers: number;

  @ApiProperty({
    example: 'Experience with React Native and TypeScript required',
  })
  requirements: string;

  @ApiProperty({
    type: 'object',
    properties: {
      name: { type: 'string', example: 'Frontend Developer' },
      slug: { type: 'string', example: 'frontend-developer' },
    },
  })
  role: {
    name: string;
    slug: string;
  };
}

export class ProjectSummaryDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7s' })
  id: string;

  @ApiProperty({ example: 'cs-guild-mobile-app' })
  slug: string;

  @ApiProperty({ example: 'CS Guild Mobile App Development' })
  title: string;

  @ApiProperty({
    example:
      'We are looking for developers to help build a mobile application for the CS Guild community.',
  })
  description: string;

  @ApiProperty({
    type: [String],
    example: ['mobile', 'react-native', 'typescript'],
  })
  tags: string[];

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  dueDate?: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: 'OPEN',
  })
  status: ProjectStatus;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ type: ProjectOwnerDto })
  owner: ProjectOwnerDto;

  @ApiProperty({ type: [ProjectRoleDto] })
  roles: ProjectRoleDto[];

  @ApiProperty({ example: 1 })
  memberCount: number;

  @ApiProperty({ example: 3 })
  applicationCount: number;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNext: boolean;

  @ApiProperty({ example: false })
  hasPrev: boolean;
}

export class ProjectListResponseDto {
  @ApiProperty({ example: 'Projects retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: [ProjectSummaryDto] })
  data: ProjectSummaryDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ProjectDetailDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7s' })
  id: string;

  @ApiProperty({ example: 'cs-guild-mobile-app' })
  slug: string;

  @ApiProperty({ example: 'CS Guild Mobile App Development' })
  title: string;

  @ApiProperty({
    example:
      'We are looking for developers to help build a mobile application for the CS Guild community.',
  })
  description: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: 'OPEN',
  })
  status: ProjectStatus;

  @ApiProperty({
    type: [String],
    example: ['mobile', 'react-native', 'typescript'],
  })
  tags: string[];

  @ApiProperty({ example: '2024-12-31T23:59:59.000Z', required: false })
  dueDate?: string;

  @ApiProperty({ type: ProjectOwnerDto })
  owner: ProjectOwnerDto;

  @ApiProperty({ type: [ProjectRoleDto] })
  roles: ProjectRoleDto[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class UserBasicDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  imageUrl?: string;
}

export class ProjectApplicationDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7a' })
  id: string;

  @ApiProperty({ example: 'cs-guild-mobile-app' })
  projectSlug: string;

  @ApiProperty({ example: 'johndoe' })
  userSlug: string;

  @ApiProperty({ example: 'frontend-developer' })
  roleSlug: string;

  @ApiProperty({
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    example: 'I would love to contribute to this project.',
    required: false,
  })
  message?: string;

  @ApiProperty({
    example: 'Great experience and skills match our requirements perfectly.',
    required: false,
  })
  reviewMessage?: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ type: UserBasicDto })
  user: UserBasicDto;

  @ApiProperty({
    type: 'object',
    properties: {
      role: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Frontend Developer' },
        },
      },
    },
  })
  projectRole: {
    role: {
      name: string;
    };
  };

  @ApiProperty({ type: UserBasicDto, required: false })
  reviewer?: UserBasicDto;
}

export class ProjectMemberDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7m' })
  id: string;

  @ApiProperty({ example: 'cs-guild-mobile-app' })
  projectSlug: string;

  @ApiProperty({ example: 'johndoe' })
  userSlug: string;

  @ApiProperty({ example: 'frontend-developer' })
  roleSlug: string;

  @ApiProperty({
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  joinedAt: string;

  @ApiProperty({ type: UserBasicDto })
  user: UserBasicDto;

  @ApiProperty({
    type: 'object',
    properties: {
      roleSlug: { type: 'string', example: 'frontend-developer' },
      role: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Frontend Developer' },
          slug: { type: 'string', example: 'frontend-developer' },
        },
      },
    },
  })
  projectRole: {
    roleSlug: string;
    role: {
      name: string;
      slug: string;
    };
  };
}
