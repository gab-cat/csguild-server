import { ApiProperty } from '@nestjs/swagger';

export class PinnedProjectDto {
  @ApiProperty({
    description: 'Unique identifier for the pinned project record',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Project slug that was pinned',
    example: 'cs-guild-mobile-app',
  })
  projectSlug: string;

  @ApiProperty({
    description: 'Timestamp when the project was pinned',
    example: '2024-07-16T10:30:00.000Z',
  })
  pinnedAt: string;

  @ApiProperty({
    description: 'Order position in the pinned projects list (1-6)',
    example: 1,
    minimum: 1,
    maximum: 6,
  })
  order: number;

  @ApiProperty({
    description: 'Username of the admin who pinned the project',
    example: 'admin-user',
  })
  pinnedBy: string;
}

export class PinProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Project pinned successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Details of the pinned project',
    type: PinnedProjectDto,
  })
  pinnedProject?: PinnedProjectDto;
}

export class UnpinProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Project unpinned successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;
}

// Error Response DTOs for Pin/Unpin operations
export class PinProjectErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    examples: {
      'project-not-found': {
        value: 'Project not found',
        description: 'When the specified project does not exist',
      },
      'already-pinned': {
        value: 'Project is already pinned',
        description: 'When trying to pin a project that is already pinned',
      },
      'max-limit-reached': {
        value: 'Maximum limit of 6 pinned projects reached',
        description: 'When trying to pin more than 6 projects',
      },
      'admin-required': {
        value: 'Admin privileges required',
        description: 'When a non-admin user tries to pin a project',
      },
    },
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    examples: {
      'not-found': {
        value: 404,
        description: 'Project not found',
      },
      conflict: {
        value: 409,
        description: 'Project already pinned',
      },
      'unprocessable-entity': {
        value: 422,
        description: 'Maximum pinned projects limit reached',
      },
      forbidden: {
        value: 403,
        description: 'Admin access required',
      },
    },
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    examples: {
      'not-found': {
        value: 'Not Found',
        description: 'Project not found error',
      },
      conflict: {
        value: 'Conflict',
        description: 'Project already pinned error',
      },
      'unprocessable-entity': {
        value: 'Unprocessable Entity',
        description: 'Maximum limit reached error',
      },
      forbidden: {
        value: 'Forbidden',
        description: 'Admin access required error',
      },
    },
  })
  error: string;
}

export class UnpinProjectErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    examples: {
      'project-not-found': {
        value: 'Project not found',
        description: 'When the specified project does not exist',
      },
      'not-pinned': {
        value: 'Project is not currently pinned',
        description: 'When trying to unpin a project that is not pinned',
      },
      'admin-required': {
        value: 'Admin privileges required',
        description: 'When a non-admin user tries to unpin a project',
      },
    },
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    examples: {
      'not-found': {
        value: 404,
        description: 'Project not found',
      },
      conflict: {
        value: 409,
        description: 'Project not currently pinned',
      },
      forbidden: {
        value: 403,
        description: 'Admin access required',
      },
    },
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type',
    examples: {
      'not-found': {
        value: 'Not Found',
        description: 'Project not found error',
      },
      conflict: {
        value: 'Conflict',
        description: 'Project not pinned error',
      },
      forbidden: {
        value: 'Forbidden',
        description: 'Admin access required error',
      },
    },
  })
  error: string;
}
