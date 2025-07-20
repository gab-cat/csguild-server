import { ApiProperty } from '@nestjs/swagger';
import { FeedbackFormResponseDto } from './feedback-form-response.dto';

export class FeedbackFormUpdateResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  statusCode: number;

  @ApiProperty({ type: FeedbackFormResponseDto })
  feedbackForm: FeedbackFormResponseDto;
}
