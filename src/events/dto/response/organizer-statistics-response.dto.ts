import { ApiProperty } from '@nestjs/swagger';

export class OrganizerStatisticsResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Organizer statistics retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Organizer statistics',
    type: 'object',
    properties: {
      totalEventsOrganized: { type: 'number', example: 15 },
      totalAttendees: { type: 'number', example: 250 },
      totalRatings: { type: 'number', example: 45 },
      averageRating: { type: 'number', example: 4.2 },
      ratingDistribution: {
        type: 'object',
        properties: {
          '1': { type: 'number', example: 2 },
          '2': { type: 'number', example: 3 },
          '3': { type: 'number', example: 8 },
          '4': { type: 'number', example: 15 },
          '5': { type: 'number', example: 17 },
        },
      },
      recentEvents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            attendeeCount: { type: 'number' },
            averageRating: { type: 'number' },
            totalRatings: { type: 'number' },
          },
        },
      },
      organizer: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
          imageUrl: { type: 'string', nullable: true },
        },
      },
    },
  })
  statistics: {
    totalEventsOrganized: number;
    totalAttendees: number;
    totalRatings: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
    recentEvents: Array<{
      id: string;
      title: string;
      slug: string;
      startDate: Date;
      endDate: Date | null;
      attendeeCount: number;
      averageRating: number;
      totalRatings: number;
    }>;
    organizer: {
      username: string;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  };
}
