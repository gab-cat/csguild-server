import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class RegisterRfidDto {
  @ApiProperty({
    description: 'RFID card ID to register',
    example: 'RF001234567',
  })
  @IsString()
  @IsNotEmpty()
  rfidId: string;

  @ApiProperty({
    description:
      'Email address of the student (if registering for existing user)',
    example: 'john.doe@example.com',
    format: 'email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class RfidLoginDto {
  @ApiProperty({
    description: 'RFID card ID for login',
    example: 'RF001234567',
  })
  @IsString()
  @IsNotEmpty()
  rfidId: string;
}

export class RfidRegistrationResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'RFID card registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Additional information',
    example: 'You can now use your RFID card to access CSGUILD services.',
    required: false,
  })
  details?: string;
}

export class RfidLoginResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'RFID login successful',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Student information',
    example: {
      id: 'clm7x8k9e0000v8og4n2h5k7s',
      email: 'john.doe@example.com',
      username: 'johndoe123',
      firstName: 'John',
      lastName: 'Doe',
    },
  })
  student: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}
