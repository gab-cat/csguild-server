import { ApiProperty } from '@nestjs/swagger';

export class UserRoleResponseDto {
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
}
