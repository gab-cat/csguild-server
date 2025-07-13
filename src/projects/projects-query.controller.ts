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
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Queries
import {
  FindAllProjectsQuery,
  GetMyProjectsQuery,
  GetMyApplicationsQuery,
  FindBySlugQuery,
  GetProjectApplicationsQuery,
  GetProjectMembersQuery,
  GetProjectBasicInfoQuery,
} from './queries';
import {
  User,
  ProjectStatus,
  Project,
  ProjectApplication,
  ProjectMember,
} from '../../generated/prisma';
import {
  ProjectDetailResponse,
  ProjectListResponse,
} from './types/project.types';
import {
  ProjectListResponseDto,
  ProjectDetailDto,
  ProjectApplicationDto,
  ProjectMemberDto,
  MyProjectsResponseDto,
  MyApplicationsResponseDto,
} from './dto';

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
    name: 'ownerSlug',
    required: false,
    description: 'Filter by project owner username',
    example: 'johndoe',
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
    @Query('ownerSlug') ownerSlug?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortOrder') sortOrder = 'desc',
  ): Promise<ProjectListResponse> {
    const filters = {
      status: status as ProjectStatus, // Will be validated by Prisma
      tags: tags ? tags.split(',') : undefined,
      search,
      ownerSlug,
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
    type: MyProjectsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getMyProjects(
    @CurrentUser() user: User,
  ): Promise<MyProjectsResponseDto> {
    const projects = await this.queryBus.execute(
      new GetMyProjectsQuery(user.username),
    );

    const ownedProjects = projects
      .filter((project) => project.owner.username === user.username)
      .map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        tags: project.tags,
        dueDate: project.dueDate?.toISOString(),
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        owner: project.owner,
        roles: project.roles.map((role) => ({
          roleSlug: role.roleSlug,
          maxMembers: role.maxMembers || 1,
          requirements: role.requirements,
          role: role.role,
        })),
        memberCount: project.memberCount,
        applicationCount: project.applicationCount,
      }));

    const memberProjects = projects
      .filter((project) => project.owner.username !== user.username)
      .map((project) => ({
        id: project.id,
        slug: project.slug,
        title: project.title,
        description: project.description,
        tags: project.tags,
        dueDate: project.dueDate?.toISOString(),
        status: project.status,
        createdAt: project.createdAt.toISOString(),
        owner: project.owner,
        roles: project.roles.map((role) => ({
          roleSlug: role.roleSlug,
          maxMembers: role.maxMembers || 1,
          requirements: role.requirements,
          role: role.role,
        })),
        memberCount: project.memberCount,
        applicationCount: project.applicationCount,
      }));

    return {
      statusCode: 200,
      message: 'User projects retrieved successfully',
      ownedProjects,
      memberProjects,
    };
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
    type: MyApplicationsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getMyApplications(
    @CurrentUser() user: User,
  ): Promise<MyApplicationsResponseDto> {
    const applications = await this.queryBus.execute(
      new GetMyApplicationsQuery(user.username),
    );
    return {
      statusCode: 200,
      message: 'Applications retrieved successfully',
      applications: applications as unknown as ProjectApplicationDto[],
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get a project by slug',
    description: 'Retrieve detailed information about a specific project',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectDetailDto,
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
  async findOne(@Param('slug') slug: string): Promise<ProjectDetailResponse> {
    return this.queryBus.execute(new FindBySlugQuery(slug));
  }

  @Get(':slug/applications')
  @ApiOperation({
    summary: 'Get project applications',
    description:
      'Retrieve all applications for a specific project, optionally filtered by role',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiQuery({
    name: 'roleSlug',
    required: false,
    description: 'Filter applications by role slug',
    example: 'frontend-developer',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project applications retrieved successfully',
    type: [ProjectApplicationDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectApplications(
    @Param('slug') slug: string,
    @Query('roleSlug') roleSlug?: string,
  ): Promise<ProjectApplication[]> {
    return this.queryBus.execute(
      new GetProjectApplicationsQuery(slug, roleSlug),
    );
  }

  @Get(':slug/members')
  @ApiOperation({
    summary: 'Get project members',
    description:
      'Retrieve all active members for a specific project, optionally filtered by role',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiQuery({
    name: 'roleSlug',
    required: false,
    description: 'Filter members by role slug',
    example: 'frontend-developer',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Project members retrieved successfully',
    type: [ProjectMemberDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectMembers(
    @Param('slug') slug: string,
    @Query('roleSlug') roleSlug?: string,
  ): Promise<ProjectMember[]> {
    return this.queryBus.execute(new GetProjectMembersQuery(slug, roleSlug));
  }

  @Get(':slug/basic')
  @ApiOperation({
    summary: 'Get basic project information',
    description:
      'Retrieve basic project information without members or applications',
  })
  @ApiParam({
    name: 'slug',
    description: 'Project slug',
    example: 'cs-guild-mobile-app',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Basic project information retrieved successfully',
    type: ProjectDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
  })
  async getProjectBasic(@Param('slug') slug: string): Promise<
    Project & {
      owner: Pick<User, 'username' | 'firstName' | 'lastName' | 'imageUrl'>;
    }
  > {
    return this.queryBus.execute(new GetProjectBasicInfoQuery(slug));
  }
}
