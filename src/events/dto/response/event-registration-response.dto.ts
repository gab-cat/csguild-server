import { ApiProperty } from '@nestjs/swagger';

export class EventRegistrationResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Successfully registered for event',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Registration details',
    example: {
      id: 'clx1234567890',
      eventId: 'clx0987654321',
      userId: 'john_doe',
      registeredAt: '2024-07-18T10:30:00.000Z',
      event: {
        id: 'clx0987654321',
        title: 'CS Guild Tech Talk',
        slug: 'cs-guild-tech-talk',
        startDate: '2024-07-20T14:00:00.000Z',
        endDate: '2024-07-20T16:00:00.000Z',
      },
      user: {
        username: 'john_doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    },
  })
  registration: {
    id: string;
    eventId: string;
    userId: string;
    registeredAt: string;
    event: {
      id: string;
      title: string;
      slug: string;
      startDate: string;
      endDate: string | null;
    };
    user: {
      username: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
}
