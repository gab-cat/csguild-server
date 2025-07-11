import { ApiProperty } from '@nestjs/swagger';
import { SignupMethod } from '../../users/dto/create-user.request';

export class AuthSuccessResponseDto {
  @ApiProperty({
    description: 'Success message indicating authentication completed',
    example: 'Authentication successful',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;
}

export class AuthErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    example: 'Credentials are not valid.',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    example: 'Unauthorized',
  })
  error: string;
}

export class AuthMeResponseDto {
  @ApiProperty({
    description: 'User',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'RFID',
    example: '1234567890',
  })
  rfidId: string;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Courses',
    example: 'Bachelor of Science in Computer Science',
  })
  course: string;

  @ApiProperty({
    description: 'Current facility ID',
    example: '1234567890',
  })
  currentFacilityId: string;

  @ApiProperty({
    description: 'Username',
    example: 'john.doe',
  })
  username: string;

  @ApiProperty({
    description: 'Role',
    example: ['admin', 'user'],
  })
  roles: string[];

  @ApiProperty({
    description: 'Created at',
    example: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
    example: '2021-01-01',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Signup method',
    example: SignupMethod.EMAIL,
    enum: SignupMethod,
  })
  signupMethod: SignupMethod;

  @ApiProperty({
    description: 'Indicates if the user has an RFID card',
    example: true,
  })
  hasRfidCard: boolean;

  @ApiProperty({
    description: 'User birth date',
    example: '2000-01-01T00:00:00.000Z',
    type: Date,
  })
  birthDate?: Date;
}
