import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectListResponseDto, ProjectDetailResponseDto } from './dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Queries
import {
  FindAllProjectsQuery,
  FindByIdQuery,
  GetMyProjectsQuery,
  GetMyApplicationsQuery,
} from './queries';
import { User, ProjectStatus } from '../../generated/prisma';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsQueryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get all projects with filtering and pagination',
    description:
      'Retrieve a paginated list of projects with optional filtering by status, tags, ' +
      'search term, and owner. No authentication required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: ProjectListResponseDto,
    examples: {
      success: {
        summary: 'Successful response',
        value: {
          message: 'Projects retrieved successfully',
          statusCode: 200,
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      },
    },
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by project status',
    enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    example: 'OPEN',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags to filter by',
    example: 'mobile,typescript,react',
    type: String,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in project title and description',
    example: 'mobile app development',
    type: String,
  })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    description: 'Filter by project owner ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
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
    enum: ['createdAt', 'updatedAt', 'dueDate', 'title'],
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
    @Query('status') status?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('ownerId') ownerId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder = 'desc',
  ): Promise<ProjectListResponseDto> {
    const filters = {
      status: status as ProjectStatus, // Will be validated by Prisma
      tags: tags ? tags.split(',') : undefined,
      search,
      ownerId,
    };

    const pagination = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as 'createdAt' | 'updatedAt' | 'dueDate' | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return this.queryBus.execute(new FindAllProjectsQuery(filters, pagination));
  }

  @Get('my-projects')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user projects',
    description:
      'Retrieve all projects owned by or where the current user is a member',
  })
  @ApiResponse({
    status: 200,
    description: 'User projects retrieved successfully',
    examples: {
      success: {
        summary: 'Successful response',
        value: {
          message: 'User projects retrieved successfully',
          statusCode: 200,
          ownedProjects: [],
          memberProjects: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getMyProjects(@CurrentUser() user: User) {
    return this.queryBus.execute(new GetMyProjectsQuery(user.id));
  }

  @Get('my-applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user applications',
    description:
      'Retrieve all project applications submitted by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'User applications retrieved successfully',
    examples: {
      success: {
        summary: 'Successful response',
        value: {
          message: 'User applications retrieved successfully',
          statusCode: 200,
          applications: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getMyApplications(@CurrentUser() user: User) {
    return this.queryBus.execute(new GetMyApplicationsQuery(user.id));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a project by ID',
    description: 'Retrieve detailed information about a specific project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clm7x8k9e0000v8og4n2h5k7s',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    examples: {
      notFound: {
        summary: 'Project not found',
        value: {
          message: 'Project not found',
          statusCode: 404,
        },
      },
    },
  })
  async findOne(@Param('id') id: string): Promise<ProjectDetailResponseDto> {
    return this.queryBus.execute(new FindByIdQuery(id));
  }
}
