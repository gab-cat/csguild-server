import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
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

// Commands
import {
  CreateEventCommand,
  UpdateEventCommand,
  DeleteEventCommand,
  ToggleSessionCommand,
  RegisterToEventCommand,
  SubmitOrganizerRatingCommand,
} from './commands';
import { User } from '../../generated/prisma';
import {
  CreateEventDto,
  UpdateEventDto,
  ToggleSessionDto,
  SubmitOrganizerRatingDto,
} from './dto/request';
import {
  EventCreateResponseDto,
  EventUpdateResponseDto,
  EventDeleteResponseDto,
  EventRegistrationResponseDto,
  OrganizerRatingResponseDto,
} from './dto/response';

@ApiTags('Events')
@Controller('events')
export class EventsCommandController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new event',
    description:
      'Create a new event. Only authenticated users can create events.',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventCreateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventCreateResponseDto> {
    const event = await this.commandBus.execute(
      new CreateEventCommand(createEventDto, user.username),
    );

    return {
      message: 'Event created successfully',
      statusCode: 201,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        type: event.type,
        description: event.description,
        details: event.details,
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

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an event',
    description:
      'Update an event. Only the event organizer can update the event.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventUpdateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors or invalid data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only event organizer can update',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async update(
    @Param('slug') slug: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentUser() user: User,
  ): Promise<EventUpdateResponseDto> {
    const event = await this.commandBus.execute(
      new UpdateEventCommand(slug, updateEventDto, user.username),
    );

    return {
      message: 'Event updated successfully',
      statusCode: 200,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        imageUrl: event.imageUrl,
        description: event.description,
        type: event.type,
        details: event.details,
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

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an event',
    description:
      'Delete an event. Only the event organizer can delete the event.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
    type: EventDeleteResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only event organizer can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async delete(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<EventDeleteResponseDto> {
    await this.commandBus.execute(new DeleteEventCommand(slug, user.username));

    return {
      message: 'Event deleted successfully',
      statusCode: 200,
    };
  }

  @Post(':slug/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Register for an event',
    description:
      'Register a user for an event using event slug and username. Only authenticated users can register for events.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for event',
    type: EventRegistrationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - event has ended or validation errors',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or user not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User is already registered for this event',
  })
  async registerToEvent(
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ): Promise<EventRegistrationResponseDto> {
    const attendee = await this.commandBus.execute(
      new RegisterToEventCommand(slug, user.username),
    );

    return {
      message: 'Successfully registered for event',
      statusCode: 201,
      registration: {
        id: attendee.id,
        eventId: attendee.eventId,
        userId: attendee.userId,
        registeredAt: attendee.registeredAt.toISOString(),
        event: {
          id: attendee.event.id,
          title: attendee.event.title,
          slug: attendee.event.slug,
          startDate: attendee.event.startDate.toISOString(),
          endDate: attendee.event.endDate?.toISOString() || null,
        },
        user: {
          username: attendee.user.username,
          firstName: attendee.user.firstName,
          lastName: attendee.user.lastName,
          email: attendee.user.email,
        },
      },
    };
  }

  @Post(':slug/rate-organizer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Rate event organizer',
    description:
      'Submit a rating for the event organizer. Only eligible attendees can rate.',
  })
  @ApiParam({
    name: 'slug',
    description: 'Event slug',
    example: 'cs-guild-tech-talk-advanced-react-patterns',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Organizer rating submitted successfully',
    type: OrganizerRatingResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid rating or already submitted',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Not an eligible attendee or trying to rate yourself',
  })
  @ApiResponse({
    status: 404,
    description: 'Event or user not found',
  })
  @ApiResponse({
    status: 409,
    description: 'You have already rated the organizer for this event',
  })
  async rateOrganizer(
    @Param('slug') slug: string,
    @Body() submitOrganizerRatingDto: SubmitOrganizerRatingDto,
    @CurrentUser() user: User,
  ): Promise<OrganizerRatingResponseDto> {
    return this.commandBus.execute(
      new SubmitOrganizerRatingCommand({
        eventSlug: slug,
        username: user.username,
        rating: submitOrganizerRatingDto.rating,
        comment: submitOrganizerRatingDto.comment,
      }),
    );
  }

  @Post('sessions/toggle')
  @ApiOperation({
    summary: 'Toggle event session (check-in/check-out)',
    description:
      'Toggle event session for a user by RFID. Automatically checks if it is a check-in or check-out.',
  })
  @ApiResponse({
    status: 201,
    description: 'Session toggled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  @ApiResponse({
    status: 404,
    description: 'User or event not found',
  })
  async toggleSession(@Body() toggleSessionDto: ToggleSessionDto) {
    const result = await this.commandBus.execute(
      new ToggleSessionCommand(
        toggleSessionDto.rfidId,
        toggleSessionDto.eventId,
      ),
    );

    return {
      message: `Successfully ${result.action}`,
      statusCode: 201,
      data: result,
    };
  }
}
