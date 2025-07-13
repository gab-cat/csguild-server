import {
  IsOptional,
  IsUUID,
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
