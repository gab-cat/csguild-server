import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackFormFieldDto } from './feedback-form-field.dto';

export class UpdateFeedbackFormDto {
  @ApiPropertyOptional({ description: 'Form title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Form fields configuration',
    type: [FeedbackFormFieldDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackFormFieldDto)
  fields?: FeedbackFormFieldDto[];

  @ApiPropertyOptional({
    description: 'Whether the form is active and can accept responses',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
