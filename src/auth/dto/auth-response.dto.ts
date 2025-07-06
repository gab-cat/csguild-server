import { ApiProperty } from '@nestjs/swagger';
import { SignupMethod } from 'src/users/dto/create-user.request';

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
  courses: string;

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
    example: 'EMAIL',
  })
  signupMethod: SignupMethod;
}
