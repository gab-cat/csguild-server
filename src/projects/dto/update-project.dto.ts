import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
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
