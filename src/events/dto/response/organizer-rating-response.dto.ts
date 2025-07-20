import { ApiProperty } from '@nestjs/swagger';

export class OrganizerRatingResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Organizer rating submitted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Rating details',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clm1234567890' },
      rating: { type: 'number', example: 4 },
      comment: { type: 'string', nullable: true, example: 'Great event!' },
      submittedAt: { type: 'string', format: 'date-time' },
      event: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
        },
      },
      user: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
        },
      },
      organizer: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
        },
      },
    },
  })
  rating: {
    id: string;
    rating: number;
    comment: string | null;
    submittedAt: Date;
    event: {
      id: string;
      title: string;
      slug: string;
    };
    user: {
      username: string;
      firstName: string | null;
      lastName: string | null;
    };
    organizer: {
      username: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
}
