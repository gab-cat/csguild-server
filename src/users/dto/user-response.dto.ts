import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma';
import { SignupMethod } from './create-user.request';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Student email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Student username',
    example: 'johndoe123',
  })
  username: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Student birthdate',
    example: '2000-01-15T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  birthdate?: Date;

  @ApiProperty({
    description: 'Student course/program',
    example: 'Bachelor of Science in Computer Science',
    required: false,
  })
  course?: string;

  @ApiProperty({
    description: 'Profile image URL',
    example: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    required: false,
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Whether user has an active refresh token',
    example: true,
  })
  hasRefreshToken: boolean;

  @ApiProperty({
    description: 'Whether user has RFID card registered',
    example: true,
  })
  hasRfidCard: boolean;

  @ApiProperty({
    description: 'RFID card ID',
    example: 'RF001234567',
    required: false,
  })
  rfidId?: string;

  @ApiProperty({
    description: 'User roles in the system',
    example: ['STUDENT'],
    enum: Role,
    isArray: true,
  })
  roles: Role[];

  @ApiProperty({
    description: 'Signup method used for registration',
    example: SignupMethod.EMAIL,
    enum: SignupMethod,
    required: false,
  })
  signupMethod?: SignupMethod;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Account last updated timestamp',
    example: '2023-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Current facility ID the user is associated with',
    example: 'facility123',
    required: false,
  })
  currentFacilityId?: string;
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'Success message',
    example:
      'Student registration successful. Please check your email for verification instructions.',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Additional information',
    example: 'A verification email has been sent to your email address.',
    required: false,
  })
  details?: string;
}
