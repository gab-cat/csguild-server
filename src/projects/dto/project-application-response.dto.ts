import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../../generated/prisma';
import { ProjectOwnerResponseDto } from './project-owner-response.dto';
import { ProjectRoleResponseDto } from './project-role-response.dto';

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
