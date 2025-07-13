import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
