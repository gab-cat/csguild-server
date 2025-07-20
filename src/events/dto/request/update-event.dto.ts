import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  IsISO8601,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { EventType } from '../../enums';

export class UpdateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'CS Guild Tech Talk: Advanced React Patterns (Updated)',
    minLength: 3,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiProperty({
    description: 'Event type',
    example: EventType.IN_PERSON,
    enum: EventType,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({
    description: 'Event image URL',
    example: 'https://example.com/event-image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Brief event description',
    example:
      'Join us for an insightful tech talk on advanced React patterns and best practices.',
    maxLength: 250,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;

  @ApiProperty({
    description: 'Detailed event description and additional information',
    example:
      'This comprehensive tech talk will cover advanced React patterns including custom hooks, ' +
      'compound components, render props, and performance optimization techniques. ' +
      'Participants will learn how to build scalable and maintainable React applications ' +
      'using modern patterns and best practices. The session includes live coding examples ' +
      'and interactive Q&A segments.',
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;

  @ApiProperty({
    description: 'Event start date and time (ISO 8601 format)',
    example: '2024-08-15T14:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({
    description: 'Event end date and time (ISO 8601 format)',
    example: '2024-08-15T16:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({
    description: 'Event tags for categorization',
    example: ['tech-talk', 'react', 'frontend', 'programming'],
    maxItems: 10,
    isArray: true,
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((tag) => tag.toLowerCase().trim())
          .filter((tag) => tag.length > 0)
      : [],
  )
  tags?: string[];

  @ApiProperty({
    description:
      'Minimum attendance duration in minutes required for certification',
    example: 120,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  minimumAttendanceMinutes?: number;
}
