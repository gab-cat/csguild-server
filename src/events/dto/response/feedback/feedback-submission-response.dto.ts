import { ApiProperty } from '@nestjs/swagger';

export class FeedbackSubmissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  formId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  attendeeId: string;

  @ApiProperty()
  responses: any;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty()
  message: string;
}
