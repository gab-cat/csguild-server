import {
  IsOptional,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectRoleDto {
  @ApiProperty({
    description: 'User role slug for this project position',
    example: 'frontend-developer',
  })
  @IsString()
  @IsNotEmpty()
  roleSlug: string;

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
