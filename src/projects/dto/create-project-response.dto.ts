import { ApiProperty } from '@nestjs/swagger';
import { ProjectDetailResponseDto } from './project-detail-response.dto';

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
