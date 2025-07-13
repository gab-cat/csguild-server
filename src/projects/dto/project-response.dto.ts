import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../../generated/prisma';

export class ProjectBasicDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7s' })
  id: string;

  @ApiProperty({ example: 'cs-guild-mobile-app' })
  slug: string;

  @ApiProperty({ example: 'CS Guild Mobile App Development' })
  title: string;

  @ApiProperty({
    enum: ProjectStatus,
    example: 'OPEN',
  })
  status: ProjectStatus;
}

export class ProjectCreateResponseDto {
  @ApiProperty({ example: 'Project created successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ type: ProjectBasicDto })
  project: ProjectBasicDto;
}

export class ProjectUpdateResponseDto {
  @ApiProperty({ example: 'Project updated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: ProjectBasicDto })
  project: ProjectBasicDto;
}

export class ProjectStatusUpdateResponseDto {
  @ApiProperty({ example: 'Project status updated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: ProjectBasicDto })
  project: ProjectBasicDto;
}

export class ProjectDeleteResponseDto {
  @ApiProperty({ example: 'Project deleted successfully' })
  message: string;
}

export class ApplicationDto {
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
}

export class JoinProjectResponseDto {
  @ApiProperty({ example: 'Application submitted successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ type: ApplicationDto })
  application: ApplicationDto;
}

export class ReviewApplicationResponseDto {
  @ApiProperty({ example: 'Application reviewed successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: ApplicationDto })
  application: ApplicationDto;
}
