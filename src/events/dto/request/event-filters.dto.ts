import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsIn,
  IsNumber,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EventType } from '../../enums';

export class EventFiltersDto {
  @ApiProperty({
    description: 'Search in event title and description',
    example: 'tech talk react',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Comma-separated list of tags to filter by',
    example: 'tech-talk,react,frontend',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Filter by event organizer username',
    example: 'johndoe',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  organizerSlug?: string;

  @ApiProperty({
    description: 'Filter by event type',
    enum: EventType,
    example: EventType.IN_PERSON,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @ApiProperty({
    description: 'Filter to show only pinned events',
    required: false,
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  pinned?: boolean;
}

export class EventPaginationDto {
  @ApiProperty({
    description: 'Page number for pagination (minimum: 1)',
    example: 1,
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page (minimum: 1, maximum: 100)',
    example: 10,
    required: false,
    type: Number,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'startDate', 'endDate', 'title'],
    example: 'startDate',
    required: false,
  })
  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'startDate', 'endDate', 'title'])
  sortBy?: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'title' =
    'startDate';

  @ApiProperty({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
    required: false,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}
