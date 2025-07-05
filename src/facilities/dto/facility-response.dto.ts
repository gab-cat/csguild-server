import { ApiProperty } from '@nestjs/swagger';

export class FacilityResponseDto {
  @ApiProperty({
    description: 'Facility ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Facility name',
    example: 'Computer Lab 1',
  })
  name: string;

  @ApiProperty({
    description: 'Facility description',
    example: 'Main computer laboratory with 30 workstations',
  })
  description?: string;

  @ApiProperty({
    description: 'Facility location',
    example: 'Building A, 2nd Floor',
  })
  location?: string;

  @ApiProperty({
    description: 'Facility capacity',
    example: 30,
  })
  capacity?: number;

  @ApiProperty({
    description: 'Current occupancy count',
    example: 15,
  })
  currentOccupancy: number;

  @ApiProperty({
    description: 'Whether facility is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Facility creation date',
    example: '2024-07-05T05:36:19.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Facility last update date',
    example: '2024-07-05T05:36:19.000Z',
  })
  updatedAt: Date;
}

export class FacilityUsageResponseDto {
  @ApiProperty({
    description: 'Usage record ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Student information',
    example: {
      id: 'clm7x8k9e0000v8og4n2h5k7s',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
    },
  })
  student: {
    id: string;
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
    description: 'Time-in timestamp',
    example: '2024-07-05T05:36:19.000Z',
  })
  timeIn: Date;

  @ApiProperty({
    description: 'Time-out timestamp (null if still active)',
    example: null,
  })
  timeOut?: Date;

  @ApiProperty({
    description: 'Whether the usage session is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Session duration in minutes (null if still active)',
    example: null,
  })
  durationMinutes?: number;
}

export class FacilityUsageStatusResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Usage status retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Whether student is currently in facility',
    example: true,
  })
  isCurrentlyInFacility: boolean;

  @ApiProperty({
    description: 'Current active session (null if not in facility)',
    type: FacilityUsageResponseDto,
  })
  currentSession?: FacilityUsageResponseDto;
}
