import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../../generated/prisma';

// Commands
import { PinEventCommand, UnpinEventCommand } from './commands';
// Queries
import { GetEventFeedbackResponsesQuery } from './queries';
import { User } from '../../generated/prisma';
import {
  EventPinResponseDto,
  EventUnpinResponseDto,
  EventFeedbackResponsesDto,
} from './dto/response';
import { FeedbackResponsesQueryDto } from './dto/request';

@ApiTags('Events Admin')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EventsAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':slug/pin')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Pin an event',
    description: 'Pin an event to highlight it. Only admins can pin events.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event pinned successfully',
    type: EventPinResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - event already pinned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async pinEvent(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<EventPinResponseDto> {
    const event = await this.commandBus.execute(
      new PinEventCommand(slug, user.username),
    );

    return {
      message: 'Event pinned successfully',
      statusCode: 200,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        description: event.description,
        details: event.details,
        type: event.type,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString() || null,
        tags: event.tags,
        isPinned: event.isPinned,
        organizedBy: event.organizedBy,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    };
  }

  @Delete(':slug/pin')
  @Roles(Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unpin an event',
    description: 'Unpin an event. Only admins can unpin events.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event unpinned successfully',
    type: EventUnpinResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - event is not pinned',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async unpinEvent(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<EventUnpinResponseDto> {
    const event = await this.commandBus.execute(
      new UnpinEventCommand(slug, user.username),
    );

    return {
      message: 'Event unpinned successfully',
      statusCode: 200,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        description: event.description,
        details: event.details,
        type: event.type,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString() || null,
        tags: event.tags,
        isPinned: event.isPinned,
        organizedBy: event.organizedBy,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      },
    };
  }

  @Get(':slug/feedback/responses')
  @Roles(Role.ADMIN, Role.STAFF)
  @ApiOperation({
    summary: 'Get event feedback responses',
    description:
      'Get all feedback responses for an event with statistics and insights. Only admins and staff can access this.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Feedback responses retrieved successfully',
    type: EventFeedbackResponsesDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin/staff role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async getEventFeedbackResponses(
    @Param('slug') slug: string,
    @Query() queryParams: FeedbackResponsesQueryDto,
  ): Promise<EventFeedbackResponsesDto> {
    const { page, limit, search, sortBy, sortOrder } = queryParams;

    return await this.queryBus.execute(
      new GetEventFeedbackResponsesQuery(
        slug,
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      ),
    );
  }
}
