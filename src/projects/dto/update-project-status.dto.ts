import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ProjectStatus } from '../../../generated/prisma';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'New project status',
    example: ProjectStatus.IN_PROGRESS,
    enum: ProjectStatus,
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;
}
