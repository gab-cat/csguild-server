import { ApiProperty } from '@nestjs/swagger';
import {
  ProjectStatus,
  ApplicationStatus,
  MemberStatus,
} from '../../../generated/prisma';

export class UserRoleResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Frontend Developer',
  })
  name: string;

  @ApiProperty({
    description: 'Role slug',
    example: 'frontend-developer',
  })
  slug: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Responsible for developing user interfaces and user experiences',
    required: false,
  })
  description?: string;
}

export class ProjectOwnerResponseDto {
  @ApiProperty({
    description: 'Owner ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Owner username',
    example: 'johndoe123',
  })
  username: string;

  @ApiProperty({
    description: 'Owner first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Owner last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Owner profile image URL',
    example: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    required: false,
  })
  imageUrl?: string;
}

export class ProjectRoleResponseDto {
  @ApiProperty({
    description: 'Project role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Role details',
    type: UserRoleResponseDto,
  })
  role: UserRoleResponseDto;

  @ApiProperty({
    description: 'Maximum members for this role',
    example: 2,
    required: false,
  })
  maxMembers?: number;

  @ApiProperty({
    description: 'Current number of members',
    example: 1,
  })
  currentMembers: number;

  @ApiProperty({
    description: 'Role requirements',
    example: 'Experience with React and TypeScript required',
    required: false,
  })
  requirements?: string;
}

export class ProjectSummaryResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Project title',
    example: 'CS Guild Mobile App Development',
  })
  title: string;

  @ApiProperty({
    description: 'Project description',
    example:
      'We are looking for developers to help build a mobile application for the CS Guild community.',
  })
  description: string;

  @ApiProperty({
    description: 'Project tags',
    example: ['mobile', 'react-native', 'typescript', 'collaboration'],
    isArray: true,
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Project due date',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Project status',
    example: ProjectStatus.OPEN,
    enum: ProjectStatus,
  })
  status: ProjectStatus;

  @ApiProperty({
    description: 'Project creation date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Project owner details',
    type: ProjectOwnerResponseDto,
  })
  owner: ProjectOwnerResponseDto;

  @ApiProperty({
    description: 'Project roles',
    type: [ProjectRoleResponseDto],
  })
  roles: ProjectRoleResponseDto[];

  @ApiProperty({
    description: 'Total number of members',
    example: 3,
  })
  memberCount: number;

  @ApiProperty({
    description: 'Total number of pending applications',
    example: 5,
  })
  applicationCount: number;
}

export class ProjectMemberResponseDto {
  @ApiProperty({
    description: 'Member ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'User details',
    type: ProjectOwnerResponseDto,
  })
  user: ProjectOwnerResponseDto;

  @ApiProperty({
    description: 'Project role',
    type: ProjectRoleResponseDto,
  })
  projectRole: ProjectRoleResponseDto;

  @ApiProperty({
    description: 'Member status',
    example: MemberStatus.ACTIVE,
    enum: MemberStatus,
  })
  status: MemberStatus;

  @ApiProperty({
    description: 'Date when user joined the project',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  joinedAt: Date;
}

export class ProjectApplicationResponseDto {
  @ApiProperty({
    description: 'Application ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Applicant details',
    type: ProjectOwnerResponseDto,
  })
  user: ProjectOwnerResponseDto;

  @ApiProperty({
    description: 'Applied project role',
    type: ProjectRoleResponseDto,
  })
  projectRole: ProjectRoleResponseDto;

  @ApiProperty({
    description: 'Application message',
    example:
      'I have 3 years of experience with React Native and would love to contribute to this project.',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Application status',
    example: ApplicationStatus.PENDING,
    enum: ApplicationStatus,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Application date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  appliedAt: Date;

  @ApiProperty({
    description: 'Review date',
    example: '2024-01-02T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  reviewedAt?: Date;

  @ApiProperty({
    description: 'Reviewer details',
    type: ProjectOwnerResponseDto,
    required: false,
  })
  reviewer?: ProjectOwnerResponseDto;
}

export class ProjectDetailResponseDto extends ProjectSummaryResponseDto {
  @ApiProperty({
    description: 'Project members',
    type: [ProjectMemberResponseDto],
  })
  members: ProjectMemberResponseDto[];

  @ApiProperty({
    description: 'Project applications',
    type: [ProjectApplicationResponseDto],
  })
  applications: ProjectApplicationResponseDto[];
}

export class ProjectListResponseDto {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectSummaryResponseDto],
  })
  data: ProjectSummaryResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
      hasNext: true,
      hasPrev: false,
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class CreateProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Project created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Created project details',
    type: ProjectDetailResponseDto,
  })
  project: ProjectDetailResponseDto;
}

export class JoinProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Application submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Application details',
    type: ProjectApplicationResponseDto,
  })
  application: ProjectApplicationResponseDto;
}
