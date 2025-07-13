import { ApiProperty } from '@nestjs/swagger';

export class UserRoleDetailResponseDto {
  @ApiProperty({
    description: 'Role ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Frontend Developer',
  })
  name: string;

  @ApiProperty({
    description: 'Role slug',
    example: 'frontend-developer',
  })
  slug: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Responsible for developing user interfaces and user experiences',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Role creation date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Role last updated date',
    example: '2024-01-01T00:00:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
