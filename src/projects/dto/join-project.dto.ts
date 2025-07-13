import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinProjectDto {
  @ApiProperty({
    description: 'Project slug to join',
    example: 'cs-guild-mobile-app',
  })
  @IsString()
  @IsNotEmpty()
  projectSlug: string;

  @ApiProperty({
    description: 'Role slug to apply for',
    example: 'frontend-developer',
  })
  @IsString()
  @IsNotEmpty()
  roleSlug: string;

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
