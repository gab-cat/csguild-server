import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackFormFieldDto {
  @ApiProperty({ description: 'Field ID/key' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Field label' })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'rating'],
  })
  @IsString()
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'rating';

  @ApiPropertyOptional({
    description: 'Whether field is required',
  })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Options for radio, checkbox, or select fields',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ description: 'Placeholder text' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Field description/help text' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Maximum rating value (for rating type)',
  })
  @IsOptional()
  maxRating?: number;
}
