import {
  IsString,
  IsOptional,
  IsUUID,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinProjectDto {
  @ApiProperty({
    description: 'Project ID to join',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Project role ID to apply for',
    example: 'clm7x8k9e0000v8og4n2h5k7t',
  })
  @IsUUID()
  @IsNotEmpty()
  projectRoleId: string;

  @ApiProperty({
    description: 'Optional message to the project owner',
    example:
      'I have 3 years of experience with React Native and would love to contribute to this project. ' +
      'I have previously worked on similar mobile applications and am excited about the CS Guild community.',
    maxLength: 1000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
