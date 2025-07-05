import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, IsNotEmpty } from 'class-validator';

export class SendEmailVerificationDto {
  @ApiProperty({
    description: 'Email address to send verification code to',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email address to verify',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Verification code sent to email (6 digits)',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  verificationCode: string;
}

export class EmailVerificationResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verification code sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Additional information',
    example: 'Please check your email for the verification code.',
    required: false,
  })
  details?: string;
}
