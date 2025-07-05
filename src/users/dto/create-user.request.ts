import {
  IsEmail,
  IsStrongPassword,
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SignupMethod {
  GOOGLE = 'GOOGLE',
  EMAIL = 'EMAIL',
  FACEBOOK = 'FACEBOOK',
  APPLE = 'APPLE',
}

export class CreateUserRequest {
  @ApiProperty({
    description: 'Student email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
    uniqueItems: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Username (must be unique, 3-30 characters, alphanumeric and underscores only)',
    example: 'johndoe123',
    minLength: 3,
    maxLength: 30,
    uniqueItems: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({
    description: 'Strong password meeting security requirements',
    example: 'MyStr0ngP@ssw0rd!',
    minLength: 8,
    pattern:
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
    format: 'password',
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Student birthdate (ISO date format)',
    example: '2000-01-15',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiProperty({
    description: 'Student course/program',
    example: 'Bachelor of Science in Computer Science',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  course?: string;

  @ApiProperty({
    description: 'RFID card ID (optional, for RFID-based registration)',
    example: 'RF001234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  rfidId?: string;

  @ApiProperty({
    description: 'Profile image URL (optional, typically from OAuth providers)',
    example: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'Signup method used for registration',
    example: SignupMethod.GOOGLE,
    enum: SignupMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(SignupMethod)
  signupMethod?: SignupMethod;
}
