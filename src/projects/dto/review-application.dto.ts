import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApplicationDecision } from './application-decision.enum';

export class ReviewApplicationDto {
  @ApiProperty({
    description: 'Application ID to review',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsString()
  applicationId: string;

  @ApiProperty({
    description: 'Decision on the application',
    example: 'APPROVED',
    enum: ApplicationDecision,
  })
  @IsEnum(ApplicationDecision)
  decision: ApplicationDecision;

  @ApiProperty({
    description: 'Optional review message',
    example: 'Welcome to the team! Your experience looks great.',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reviewMessage?: string;
}
