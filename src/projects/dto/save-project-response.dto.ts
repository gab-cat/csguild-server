import { ApiProperty } from '@nestjs/swagger';

export class SavedProjectDto {
  @ApiProperty({
    description: 'Unique identifier for the saved project record',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user who saved the project',
    example: 'john-doe',
  })
  userSlug: string;

  @ApiProperty({
    description: 'Project slug that was saved',
    example: 'cs-guild-mobile-app',
  })
  projectSlug: string;

  @ApiProperty({
    description: 'Timestamp when the project was saved',
    example: '2024-07-16T10:30:00.000Z',
  })
  savedAt: string;
}

export class SaveProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Project saved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Details of the saved project',
    type: SavedProjectDto,
  })
  savedProject: SavedProjectDto;
}

export class UnsaveProjectResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Project unsaved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;
}

// Error Response DTOs for Save/Unsave operations
export class SaveProjectErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    examples: {
      'project-not-found': {
        value: 'Project not found',
        description: 'When the specified project does not exist',
      },
      'already-saved': {
        value: 'Project is already saved by this user',
        description:
          'When trying to save a project that is already saved by the user',
      },
      unauthorized: {
        value: 'Authentication required',
        description: 'When an unauthenticated user tries to save a project',
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
        description: 'Project already saved',
      },
      unauthorized: {
        value: 401,
        description: 'Authentication required',
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
        description: 'Project already saved error',
      },
      unauthorized: {
        value: 'Unauthorized',
        description: 'Authentication required error',
      },
    },
  })
  error: string;
}

export class UnsaveProjectErrorResponseDto {
  @ApiProperty({
    description: 'Error message',
    examples: {
      'project-not-found': {
        value: 'Project not found',
        description: 'When the specified project does not exist',
      },
      'not-saved': {
        value: 'Project is not currently saved by this user',
        description:
          'When trying to unsave a project that is not saved by the user',
      },
      unauthorized: {
        value: 'Authentication required',
        description: 'When an unauthenticated user tries to unsave a project',
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
        description: 'Project not currently saved',
      },
      unauthorized: {
        value: 401,
        description: 'Authentication required',
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
        description: 'Project not saved error',
      },
      unauthorized: {
        value: 'Unauthorized',
        description: 'Authentication required error',
      },
    },
  })
  error: string;
}
