import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SubmitOrganizerRatingCommand } from './submit-organizer-rating.command';

@Injectable()
@CommandHandler(SubmitOrganizerRatingCommand)
export class SubmitOrganizerRatingHandler
  implements ICommandHandler<SubmitOrganizerRatingCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SubmitOrganizerRatingCommand) {
    const { eventSlug, eventId, username, rating, comment } = command.params;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Validate that either eventSlug or eventId is provided
    if (!eventSlug && !eventId) {
      throw new BadRequestException(
        'Either eventSlug or eventId must be provided',
      );
    }

    // Find the event by slug or id
    const whereClause = eventSlug ? { slug: eventSlug } : { id: eventId };
    const event = await this.prisma.event.findUnique({
      where: whereClause,
      include: {
        organizer: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!event) {
      const identifier = eventSlug ? `slug '${eventSlug}'` : `id '${eventId}'`;
      throw new NotFoundException(`Event with ${identifier} not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }

    // Check if user attended the event and is eligible
    const attendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: username,
        },
      },
    });

    if (!attendee) {
      throw new ForbiddenException(
        'You must be an attendee of this event to rate the organizer',
      );
    }

    if (!attendee.isEligible) {
      throw new ForbiddenException(
        'You have not met the minimum attendance requirement to rate the organizer',
      );
    }

    // Check if user has already rated this organizer for this event
    const existingRating = await this.prisma.eventOrganizerRating.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: username,
        },
      },
    });

    if (existingRating) {
      throw new ConflictException(
        'You have already rated the organizer for this event',
      );
    }

    // Prevent organizer from rating themselves
    if (event.organizedBy === username) {
      throw new ForbiddenException('You cannot rate yourself as an organizer');
    }

    // Create the rating
    const organizerRating = await this.prisma.eventOrganizerRating.create({
      data: {
        eventId: event.id,
        userId: username,
        rating,
        comment,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Organizer rating submitted successfully',
      statusCode: 201,
      rating: {
        id: organizerRating.id,
        rating: organizerRating.rating,
        comment: organizerRating.comment,
        submittedAt: organizerRating.submittedAt,
        event: organizerRating.event,
        user: organizerRating.user,
        organizer: event.organizer,
      },
    };
  }
}
