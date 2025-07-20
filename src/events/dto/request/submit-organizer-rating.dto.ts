import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class SubmitOrganizerRatingDto {
  @ApiProperty({
    description: 'Rating for the event organizer (1-5 scale)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional comment about the organizer',
    required: false,
    maxLength: 1000,
    example: 'Great event organization and communication throughout!',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
