import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitFeedbackResponseDto {
  @ApiProperty({ description: 'Feedback form ID' })
  @IsString()
  formId: string;

  @ApiProperty({
    description: 'User responses to form fields',
    example: {
      rating: 5,
      comments: 'Great event!',
      topics: ['AI', 'Machine Learning'],
    },
  })
  @IsObject()
  responses: Record<string, any>;
}
