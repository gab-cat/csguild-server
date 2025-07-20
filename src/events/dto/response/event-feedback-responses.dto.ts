import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventFeedbackFormFieldDto {
  @ApiProperty({
    description: 'Field identifier',
    example: 'field_1752868268397_9l6dmh8nt',
  })
  id: string;

  @ApiProperty({
    description: 'Field type',
    example: 'radio',
    enum: ['radio', 'checkbox', 'text', 'textarea', 'rating'],
  })
  type: string;

  @ApiProperty({
    description: 'Field label',
    example: 'Were the speakers engaging and knowledgeable?',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Available options for radio/checkbox fields',
    example: ['Yes', 'No'],
  })
  options?: string[];

  @ApiPropertyOptional({
    description: 'Whether the field is required',
    example: true,
  })
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Field description',
    example: 'Please provide your honest feedback',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Placeholder text for text fields',
    example: 'Enter your response...',
  })
  placeholder?: string;

  @ApiPropertyOptional({
    description: 'Maximum rating value for rating fields',
    example: 5,
  })
  maxRating?: number;
}

export class EventFeedbackFormDto {
  @ApiProperty({
    description: 'Form identifier',
    example: 'form_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Form title',
    example: 'Event Feedback',
  })
  title: string;

  @ApiProperty({
    description: 'Form fields',
    type: [EventFeedbackFormFieldDto],
  })
  fields: EventFeedbackFormFieldDto[];
}

export class FeedbackResponseUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'john.doe',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'First name',
    example: 'John',
  })
  firstName: string | null;

  @ApiPropertyOptional({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Profile image URL',
    example: 'https://example.com/avatar.jpg',
  })
  imageUrl: string | null;
}

export class FeedbackResponseAttendeeDto {
  @ApiProperty({
    description: 'Total attendance duration in minutes',
    example: 120,
  })
  totalDuration: number;

  @ApiProperty({
    description: 'Whether the attendee is eligible for certification',
    example: true,
  })
  isEligible: boolean;
}

export class FeedbackResponseDto {
  @ApiProperty({
    description: 'Response identifier',
    example: 'response_123456789',
  })
  id: string;

  @ApiProperty({
    description: 'User responses to form fields',
    example: {
      field_1752868268397_9l6dmh8nt: 'Yes',
      field_1752868282614_vicpdecrh: 'Everything was great!',
      field_1752868305979_kwsa7f3mt: '5',
    },
  })
  responses: Record<string, any>;

  @ApiProperty({
    description: 'When the response was submitted',
    example: '2024-01-15T10:30:00Z',
  })
  submittedAt: string;

  @ApiProperty({
    description: 'User information',
    type: FeedbackResponseUserDto,
  })
  user: FeedbackResponseUserDto;

  @ApiProperty({
    description: 'Attendee information',
    type: FeedbackResponseAttendeeDto,
  })
  attendee: FeedbackResponseAttendeeDto;
}

export class FieldStatisticsDto {
  @ApiProperty({
    description: 'Field label',
    example: 'Were the speakers engaging and knowledgeable?',
  })
  fieldLabel: string;

  @ApiProperty({
    description: 'Field type',
    example: 'radio',
  })
  fieldType: string;

  @ApiProperty({
    description: 'Total number of answers for this field',
    example: 25,
  })
  totalAnswers: number;

  @ApiProperty({
    description: 'Response rate percentage for this field',
    example: 83.33,
  })
  responseRate: number;

  @ApiPropertyOptional({
    description: 'Option counts for radio/checkbox fields',
    example: { Yes: 20, No: 5 },
  })
  optionCounts?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Most popular option for radio/checkbox fields',
    example: { option: 'Yes', count: 20 },
  })
  mostPopular?: { option: string; count: number };

  @ApiPropertyOptional({
    description: 'Average rating for rating fields',
    example: 4.2,
  })
  average?: number;

  @ApiPropertyOptional({
    description: 'Minimum rating for rating fields',
    example: 1,
  })
  min?: number;

  @ApiPropertyOptional({
    description: 'Maximum rating for rating fields',
    example: 5,
  })
  max?: number;

  @ApiPropertyOptional({
    description: 'Rating distribution for rating fields',
    example: { '1': 2, '2': 1, '3': 3, '4': 8, '5': 11 },
  })
  distribution?: Record<string, number>;

  @ApiPropertyOptional({
    description: 'Average word count for text fields',
    example: 12.5,
  })
  averageWordCount?: number;

  @ApiPropertyOptional({
    description: 'Total word count for text fields',
    example: 250,
  })
  totalWords?: number;

  @ApiPropertyOptional({
    description: 'Sample responses for text fields',
    example: ['Great event!', 'Learned a lot', 'Would attend again'],
  })
  sampleResponses?: string[];

  @ApiPropertyOptional({
    description: 'Sample answers for other field types',
    example: ['Option1', 'Option2', 'Option3'],
  })
  sampleAnswers?: any[];
}

export class FeedbackStatisticsDto {
  @ApiProperty({
    description: 'Total number of feedback responses',
    example: 30,
  })
  totalResponses: number;

  @ApiProperty({
    description: 'Total number of event attendees',
    example: 45,
  })
  totalAttendees: number;

  @ApiProperty({
    description: 'Response rate percentage',
    example: 66.67,
  })
  responseRate: number;

  @ApiProperty({
    description: 'Statistics for each form field',
    additionalProperties: {
      type: 'object',
      $ref: '#/components/schemas/FieldStatisticsDto',
    },
  })
  fieldStats: Record<string, FieldStatisticsDto>;
}

export class FeedbackResponsesMetaDto {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of responses',
    example: 30,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 2,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage: boolean;
}

export class EventFeedbackResponsesDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Feedback responses retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'List of feedback responses',
    type: [FeedbackResponseDto],
  })
  responses: FeedbackResponseDto[];

  @ApiPropertyOptional({
    description: 'Feedback form information',
    type: EventFeedbackFormDto,
  })
  form: EventFeedbackFormDto | null;

  @ApiProperty({
    description: 'Feedback statistics',
    type: FeedbackStatisticsDto,
  })
  statistics: FeedbackStatisticsDto;

  @ApiProperty({
    description: 'Pagination metadata',
    type: FeedbackResponsesMetaDto,
  })
  meta: FeedbackResponsesMetaDto;
}
