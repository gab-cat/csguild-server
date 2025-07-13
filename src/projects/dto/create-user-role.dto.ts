import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Frontend Developer',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Role slug (URL-friendly identifier)',
    example: 'frontend-developer',
    minLength: 2,
    maxLength: 50,
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, alphanumeric, and use hyphens for separation',
  })
  slug: string;

  @ApiProperty({
    description: 'Role description',
    example:
      'Responsible for developing user interfaces and user experiences using modern frontend technologies',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
