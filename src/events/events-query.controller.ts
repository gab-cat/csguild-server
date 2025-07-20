import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Queries
import {
  FindAllEventsQuery,
  FindEventBySlugQuery,
  GetMyAttendedEventsQuery,
  GetMyCreatedEventsQuery,
  GetPinnedEventsQuery,
  GetEventSessionsQuery,
  GetEventAttendeesQuery,
  CheckFeedbackResponseQuery,
  GetOrganizerStatisticsQuery,
} from './queries';
import { User } from '../../generated/prisma';
import {
  EventFilters,
  EventPagination,
  EventListResponse,
  EventDetailResponse,
} from './types/event.types';
import {
  EventListResponseDto,
  EventDetailResponseDto,
  OrganizerStatisticsResponseDto,
} from './dto/response';
import { FeedbackStatusResponseDto } from './dto/response/feedback';

@ApiTags('Events')
@Controller('events')
export class EventsQueryController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({
    summary: 'Get all events with filtering and pagination',
    description:
      'Retrieve a paginated list of events with optional filtering by search term, tags, ' +
      'organizer, and pinned status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: EventListResponseDto,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in event title and description',
    example: 'tech talk react',
    type: String,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags to filter by',
    example: 'tech-talk,react,frontend',
    type: String,
  })
  @ApiQuery({
    name: 'organizerSlug',
    required: false,
    description: 'Filter by event organizer username',
    example: 'johndoe',
    type: String,
  })
  @ApiQuery({
    name: 'pinned',
    required: false,
    description: 'Filter to show only pinned events',
    type: Boolean,
    example: true,
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
    enum: ['createdAt', 'updatedAt', 'startDate', 'endDate', 'title'],
    example: 'startDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by event type',
    enum: ['IN_PERSON', 'VIRTUAL', 'HYBRID', 'OTHERS'],
    example: 'IN_PERSON',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('organizerSlug') organizerSlug?: string,
    @Query('pinned') pinned?: boolean,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'startDate',
    @Query('sortOrder') sortOrder = 'asc',
  ): Promise<EventListResponse> {
    const filters: EventFilters = {
      search,
      tags: tags ? tags.split(',') : undefined,
      organizerSlug,
      pinned,
      type: type as any,
    };

    const pagination: EventPagination = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'startDate'
        | 'endDate'
        | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return this.queryBus.execute(new FindAllEventsQuery(filters, pagination));
  }

  @Get('my-attended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get events attended by current user',
    description:
      'Retrieve events that the current user has attended with filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Attended events retrieved successfully',
    type: EventListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in event title and description',
    example: 'tech talk react',
    type: String,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags to filter by',
    example: 'tech-talk,react,frontend',
    type: String,
  })
  @ApiQuery({
    name: 'organizerSlug',
    required: false,
    description: 'Filter by event organizer username',
    example: 'johndoe',
    type: String,
  })
  @ApiQuery({
    name: 'pinned',
    required: false,
    description: 'Filter to show only pinned events',
    type: Boolean,
    example: true,
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
    enum: ['createdAt', 'updatedAt', 'startDate', 'endDate', 'title'],
    example: 'startDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by event type',
    enum: ['IN_PERSON', 'VIRTUAL', 'HYBRID', 'OTHERS'],
    example: 'IN_PERSON',
  })
  async getMyAttendedEvents(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('organizerSlug') organizerSlug?: string,
    @Query('pinned') pinned?: boolean,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'startDate',
    @Query('sortOrder') sortOrder = 'asc',
  ): Promise<EventListResponse> {
    const filters: EventFilters = {
      search,
      tags: tags ? tags.split(',') : undefined,
      organizerSlug,
      pinned,
      type: type as any,
    };

    const pagination: EventPagination = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'startDate'
        | 'endDate'
        | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return this.queryBus.execute(
      new GetMyAttendedEventsQuery(user.username, filters, pagination),
    );
  }

  @Get('my-created')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get events created by current user',
    description:
      'Retrieve events that the current user has created with filtering and pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Created events retrieved successfully',
    type: EventListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search in event title and description',
    example: 'tech talk react',
    type: String,
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Comma-separated list of tags to filter by',
    example: 'tech-talk,react,frontend',
    type: String,
  })
  @ApiQuery({
    name: 'pinned',
    required: false,
    description: 'Filter to show only pinned events',
    type: Boolean,
    example: true,
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
    enum: ['createdAt', 'updatedAt', 'startDate', 'endDate', 'title'],
    example: 'startDate',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by event type',
    enum: ['IN_PERSON', 'VIRTUAL', 'HYBRID', 'OTHERS'],
    example: 'IN_PERSON',
  })
  async getMyCreatedEvents(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('pinned') pinned?: boolean,
    @Query('type') type?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('sortBy') sortBy = 'startDate',
    @Query('sortOrder') sortOrder = 'asc',
  ): Promise<EventListResponse> {
    const filters: EventFilters = {
      search,
      tags: tags ? tags.split(',') : undefined,
      pinned,
      type: type as any,
    };

    const pagination: EventPagination = {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as
        | 'createdAt'
        | 'updatedAt'
        | 'startDate'
        | 'endDate'
        | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    return this.queryBus.execute(
      new GetMyCreatedEventsQuery(user.username, filters, pagination),
    );
  }

  @Get('pinned')
  @ApiOperation({
    summary: 'Get all pinned events',
    description:
      'Retrieve all events that are currently pinned (no pagination).',
  })
  @ApiResponse({
    status: 200,
    description: 'Pinned events retrieved successfully',
    type: [EventDetailResponseDto],
  })
  async getPinnedEvents(): Promise<EventDetailResponse[]> {
    return this.queryBus.execute(new GetPinnedEventsQuery());
  }

  @Get('sessions/:slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get event sessions by event slug',
    description:
      'Retrieve all attendees and their sessions for a specific event. Requires authentication.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event sessions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async getEventSessions(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetEventSessionsQuery(slug));
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get an event by slug',
    description: 'Retrieve detailed information about a specific event',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
    examples: {
      notFound: {
        summary: 'Event not found',
        value: {
          message: 'Event not found',
          statusCode: 404,
        },
      },
    },
  })
  async findOne(@Param('slug') slug: string): Promise<EventDetailResponse> {
    return this.queryBus.execute(new FindEventBySlugQuery(slug));
  }

  @Get(':eventId/attendees')
  @ApiOperation({
    summary: 'Get event attendees',
    description:
      'Retrieve all attendees for a specific event with their basic information and attendance stats.',
  })
  @ApiParam({
    name: 'eventId',
    description: 'Event ID',
    example: 'cuid123456789',
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
    example: 50,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Event attendees retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        statusCode: { type: 'number' },
        attendees: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              imageUrl: { type: 'string', nullable: true },
              email: { type: 'string' },
              totalDuration: { type: 'number' },
              isEligible: { type: 'boolean' },
              registeredAt: { type: 'string', format: 'date-time' },
              sessionCount: { type: 'number' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async getEventAttendees(
    @Param('eventId') eventId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ) {
    return this.queryBus.execute(
      new GetEventAttendeesQuery(eventId, {
        page: Number(page),
        limit: Number(limit),
      }),
    );
  }

  @Get(':slug/feedback/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Check if user has submitted feedback for an event',
    description:
      'Check if the current user has already submitted feedback for a specific event.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'my-event',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback status retrieved successfully',
    type: FeedbackStatusResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async checkFeedbackResponse(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ) {
    return this.queryBus.execute(
      new CheckFeedbackResponseQuery(slug, user.username),
    );
  }

  @Get('organizer/:username/statistics')
  @ApiOperation({
    summary: 'Get organizer statistics',
    description:
      'Retrieve comprehensive statistics for an event organizer including total events, ratings, and recent events.',
  })
  @ApiParam({
    name: 'username',
    description: 'Username of the organizer',
    example: 'john_doe',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizer statistics retrieved successfully',
    type: OrganizerStatisticsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organizer not found',
  })
  async getOrganizerStatistics(
    @Param('username') username: string,
  ): Promise<OrganizerStatisticsResponseDto> {
    return this.queryBus.execute(new GetOrganizerStatisticsQuery(username));
  }
}
