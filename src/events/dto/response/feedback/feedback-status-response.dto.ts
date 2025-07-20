import { ApiProperty } from '@nestjs/swagger';

export class FeedbackStatusResponseDto {
  @ApiProperty({
    description: 'Whether the event has an active feedback form',
    example: true,
  })
  hasForm: boolean;

  @ApiProperty({
    description: 'Whether the user has submitted feedback',
    example: false,
  })
  hasSubmitted: boolean;

  @ApiProperty({
    description: 'ID of the feedback form if it exists',
    example: 'cuid123456789',
    nullable: true,
  })
  formId: string | null;

  @ApiProperty({
    description: 'When the user submitted their feedback',
    example: '2025-07-19T10:30:00.000Z',
    nullable: true,
  })
  submittedAt: Date | null;
}
