import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
import { User } from '../../generated/prisma';
import { EventPinResponseDto, EventUnpinResponseDto } from './dto/response';

@ApiTags('Events Admin')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EventsAdminController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
