import { ApiProperty } from '@nestjs/swagger';

export class ProjectOwnerResponseDto {
  @ApiProperty({
    description: 'Owner ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Owner username',
    example: 'johndoe123',
  })
  username: string;

  @ApiProperty({
    description: 'Owner first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Owner last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Owner profile image URL',
    example: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    required: false,
  })
  imageUrl?: string;
}
