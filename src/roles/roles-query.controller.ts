import { Controller, Get, Param, ParseEnumPipe, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RoleListResponseDto, RoleResponseDto } from './dto';

// Queries
import { FindAllRolesQuery, FindRoleBySlugQuery } from './queries';

@ApiTags('Roles')
@Controller('roles')
export class RolesQueryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get all roles with filtering and pagination',
    description:
      'Retrieve a paginated list of roles with optional filtering by search term. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
    type: RoleListResponseDto,
    examples: {
      success: {
        summary: 'Successful response',
        value: {
          message: 'Roles retrieved successfully',
          statusCode: 200,
          data: [
            {
              id: 'clm7x8k9e0000v8og4n2h5k7s',
              name: 'Frontend Developer',
              slug: 'frontend-developer',
              description:
                'Responsible for building and maintaining user interfaces using modern web technologies',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
            {
              id: 'clm7x8k9e0000v8og4n2h5k7t',
              name: 'Backend Developer',
              slug: 'backend-developer',
              description:
                'Develops server-side applications, APIs, and database architecture',
              createdAt: '2024-01-16T10:30:00.000Z',
              updatedAt: '2024-01-16T10:30:00.000Z',
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
    },
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in role name, slug, and description',
    example: 'frontend developer',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination (minimum: 1)',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (minimum: 1, maximum: 100)',
    example: 10,
    type: Number,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Field to sort by',
    enum: ['createdAt', 'updatedAt', 'name', 'slug'],
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query(
      'sortBy',
      new ParseEnumPipe(['createdAt', 'updatedAt', 'name', 'slug', undefined]),
    )
    sortBy:
      | 'createdAt'
      | 'updatedAt'
      | 'name'
      | 'slug'
      | undefined = 'createdAt',
    @Query('sortOrder', new ParseEnumPipe(['asc', 'desc', undefined]))
    sortOrder: 'asc' | 'desc' | undefined = 'desc',
  ): Promise<RoleListResponseDto> {
    const filters = {
      search,
    };

    const pagination = {
      page: Number(page),
      limit: Math.min(Number(limit), 100), // Max 100 items per page
      sortBy: sortBy as 'createdAt' | 'updatedAt' | 'name' | 'slug',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return this.queryBus.execute(new FindAllRolesQuery(filters, pagination));
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get a role by slug',
    description:
      'Retrieve detailed information about a specific role by its slug. No authentication required.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Role slug',
    example: 'frontend-developer',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Role retrieved successfully',
    type: RoleResponseDto,
    examples: {
      success: {
        summary: 'Successful response',
        value: {
          id: 'clm7x8k9e0000v8og4n2h5k7s',
          name: 'Frontend Developer',
          slug: 'frontend-developer',
          description:
            'Responsible for building and maintaining user interfaces using modern web technologies',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
    examples: {
      notFound: {
        summary: 'Role not found',
        value: {
          message: 'Role not found',
          statusCode: 404,
        },
      },
    },
  })
  async findBySlug(@Param('slug') slug: string): Promise<RoleResponseDto> {
    return await this.queryBus.execute(new FindRoleBySlugQuery(slug));
  }
}
