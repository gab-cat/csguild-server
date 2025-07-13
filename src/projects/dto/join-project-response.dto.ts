import { ApiProperty } from '@nestjs/swagger';
import { ProjectApplicationResponseDto } from './project-application-response.dto';

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
