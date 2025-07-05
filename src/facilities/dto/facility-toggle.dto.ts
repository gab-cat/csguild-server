import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacilityToggleDto {
  @ApiProperty({
    description: 'RFID card ID for facility access',
    example: 'RFID123456789',
  })
  @IsString()
  @IsNotEmpty()
  rfidId: string;

  @ApiProperty({
    description: 'Facility ID to toggle access for',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  @IsString()
  @IsNotEmpty()
  facilityId: string;
}

export class FacilityToggleResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Time-in successful',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Action performed',
    example: 'time-in',
    enum: ['time-in', 'time-out'],
  })
  action: 'time-in' | 'time-out';

  @ApiProperty({
    description: 'Action details',
    example: 'Successfully checked in to Computer Lab 1',
  })
  details: string;

  @ApiProperty({
    description: 'Student information',
    example: {
      id: 'clm7x8k9e0000v8og4n2h5k7s',
      imageUrl: 'https://example.com/image.jpg',
      course: 'Computer Science',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
    },
  })
  student: {
    id: string;
    imageUrl: string;
    course: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
  };

  @ApiProperty({
    description: 'Facility information',
    example: {
      id: 'clm7x8k9e0000v8og4n2h5k7s',
      name: 'Computer Lab 1',
      location: 'Building A, 2nd Floor',
    },
  })
  facility: {
    id: string;
    name: string;
    location?: string;
  };

  @ApiProperty({
    description: 'Session information',
    example: {
      id: 'clm7x8k9e0000v8og4n2h5k7s',
      timeIn: '2024-07-05T05:36:19.000Z',
      timeOut: null,
      isActive: true,
      durationMinutes: null,
    },
  })
  session: {
    id: string;
    timeIn: Date;
    timeOut?: Date;
    isActive: boolean;
    durationMinutes?: number;
  };
}
