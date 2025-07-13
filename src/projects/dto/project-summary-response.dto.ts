import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../../generated/prisma';
import { ProjectOwnerResponseDto } from './project-owner-response.dto';
import { ProjectRoleResponseDto } from './project-role-response.dto';

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
