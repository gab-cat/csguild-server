import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the role',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'The role name',
    example: 'Frontend Developer',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug for the role',
    example: 'frontend-developer',
  })
  slug: string;

  @ApiProperty({
    description: 'Detailed description of the role',
    example:
      'Responsible for building and maintaining user interfaces using modern web technologies',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'When the role was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the role was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class CreateRoleResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Role created successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The created role',
    type: RoleResponseDto,
  })
  role: RoleResponseDto;
}

export class UpdateRoleResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Role updated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'The updated role',
    type: RoleResponseDto,
  })
  role: RoleResponseDto;
}

export class RoleListResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Roles retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Array of roles',
    type: [RoleResponseDto],
  })
  data: RoleResponseDto[];

  @ApiProperty({
    description: 'Total number of roles',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}
