import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  ArrayMaxSize,
  IsUUID,
  ValidateNested,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateProjectRoleDto {
  @ApiProperty({
    description: 'User role ID for this project position',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    description: 'Maximum number of members for this role',
    example: 2,
    minimum: 1,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxMembers?: number;

  @ApiProperty({
    description: 'Specific requirements for this role',
    example: 'Experience with React and TypeScript required',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  requirements?: string;
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'CS Guild Mobile App Development',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Detailed project description',
    example:
      'We are looking for developers to help build a mobile application for the CS Guild community. ' +
      'The app will include features for project collaboration, event management, and member networking.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({
    description: 'Project tags for categorization',
    example: ['mobile', 'react-native', 'typescript', 'collaboration'],
    maxItems: 10,
    isArray: true,
    type: [String],
  })
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
  tags: string[];

  @ApiProperty({
    description: 'Project due date (ISO date format)',
    example: '2024-12-31T23:59:59.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Required roles for this project',
    type: [CreateProjectRoleDto],
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProjectRoleDto)
  @ArrayMaxSize(10)
  roles: CreateProjectRoleDto[];
}
