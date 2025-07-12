import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ProjectStatus } from '../../../generated/prisma';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({
    description: 'Project status',
    example: ProjectStatus.IN_PROGRESS,
    enum: ProjectStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'New project status',
    example: ProjectStatus.IN_PROGRESS,
    enum: ProjectStatus,
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}

export class ReviewApplicationDto {
  @ApiProperty({
    description: 'Application ID to review',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsString()
  applicationId: string;

  @ApiProperty({
    description: 'Decision on the application',
    example: 'APPROVED',
    enum: ['APPROVED', 'REJECTED'],
  })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Optional review message',
    example: 'Welcome to the team! Your experience looks great.',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewMessage?: string;
}
