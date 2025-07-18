import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '../../enums';

export class EventBasicResponseDto {
  @ApiProperty({ example: 'clm7x8k9e0000v8og4n2h5k7s' })
  id: string;

  @ApiProperty({ example: 'cs-guild-tech-talk-advanced-react-patterns' })
  slug: string;

  @ApiProperty({ example: 'CS Guild Tech Talk: Advanced React Patterns' })
  title: string;

  @ApiProperty({ example: EventType.IN_PERSON, enum: EventType })
  type: EventType;

  @ApiProperty({
    example: 'https://example.com/event-image.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({
    example:
      'Join us for an insightful tech talk on advanced React patterns...',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example:
      'This comprehensive tech talk will cover advanced React patterns including custom hooks, ' +
      'compound components, render props, and performance optimization techniques...',
    nullable: true,
  })
  details: string | null;

  @ApiProperty({ example: '2024-08-15T14:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2024-08-15T16:00:00.000Z', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: ['tech-talk', 'react', 'frontend'] })
  tags: string[];

  @ApiProperty({ example: false })
  isPinned: boolean;

  @ApiProperty({ example: 'johndoe' })
  organizedBy: string;

  @ApiProperty({ example: '2024-08-01T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-08-01T10:00:00.000Z' })
  updatedAt: string;
}

export class EventOrganizerDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  imageUrl: string | null;

  @ApiProperty({ example: 'johndoe@example.com' })
  email: string;
}

export class EventDetailResponseDto extends EventBasicResponseDto {
  @ApiProperty({ type: EventOrganizerDto })
  organizer: EventOrganizerDto;
}

export class EventCreateResponseDto {
  @ApiProperty({ example: 'Event created successfully' })
  message: string;

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ type: EventBasicResponseDto })
  event: EventBasicResponseDto;
}

export class EventUpdateResponseDto {
  @ApiProperty({ example: 'Event updated successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: EventBasicResponseDto })
  event: EventBasicResponseDto;
}

export class EventDeleteResponseDto {
  @ApiProperty({ example: 'Event deleted successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;
}

export class EventPinResponseDto {
  @ApiProperty({ example: 'Event pinned successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: EventBasicResponseDto })
  event: EventBasicResponseDto;
}

export class EventUnpinResponseDto {
  @ApiProperty({ example: 'Event unpinned successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: EventBasicResponseDto })
  event: EventBasicResponseDto;
}

export class EventListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class EventListResponseDto {
  @ApiProperty({ example: 'Events retrieved successfully' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ type: [EventDetailResponseDto] })
  events: EventDetailResponseDto[];

  @ApiProperty({ type: EventListMetaDto })
  meta: EventListMetaDto;
}
