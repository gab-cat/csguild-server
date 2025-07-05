import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacilityDto {
  @ApiProperty({
    description: 'Facility name',
    example: 'Computer Lab 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Facility description',
    example: 'Main computer laboratory with 30 workstations',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Facility location',
    example: 'Building A, 2nd Floor',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Facility capacity',
    example: 30,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Whether facility is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFacilityDto {
  @ApiProperty({
    description: 'Facility name',
    example: 'Computer Lab 1',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Facility description',
    example: 'Main computer laboratory with 30 workstations',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Facility location',
    example: 'Building A, 2nd Floor',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Facility capacity',
    example: 30,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'Whether facility is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
