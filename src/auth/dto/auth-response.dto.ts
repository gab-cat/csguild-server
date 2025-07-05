import { ApiProperty } from '@nestjs/swagger';

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
