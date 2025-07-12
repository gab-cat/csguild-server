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

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'Senior Frontend Developer',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Role description',
    example:
      'Lead frontend developer responsible for architecture and mentoring',
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class UserRoleDetailResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Frontend Developer',
  })
  name: string;

  @ApiProperty({
    description: 'Role slug',
    example: 'frontend-developer',
  })
  slug: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Responsible for developing user interfaces and user experiences',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Role creation date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Role last updated date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
