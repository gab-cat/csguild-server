import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackFormFieldDto } from './feedback-form-field.dto';

export class CreateFeedbackFormDto {
  @ApiProperty({ description: 'Event ID' })
  @IsString()
  eventId: string;

  @ApiPropertyOptional({ description: 'Form title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Form fields configuration',
    type: [FeedbackFormFieldDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackFormFieldDto)
  fields: FeedbackFormFieldDto[];
}
