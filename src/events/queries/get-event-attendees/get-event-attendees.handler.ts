import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetEventAttendeesQuery } from './get-event-attendees.query';

export interface EventAttendeeInfo {
  username: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  email: string;
  totalDuration: number;
  isEligible: boolean;
  registeredAt: Date;
  sessionCount: number;
}

export interface EventAttendeesResponse {
  message: string;
  statusCode: number;
  attendees: EventAttendeeInfo[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
@QueryHandler(GetEventAttendeesQuery)
export class GetEventAttendeesHandler
  implements IQueryHandler<GetEventAttendeesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetEventAttendeesQuery,
  ): Promise<EventAttendeesResponse> {
    const { eventId, pagination } = query;
    const { page, limit } = pagination;

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Get total count for pagination
    const total = await this.prisma.eventAttendee.count({
      where: { eventId },
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get attendees with user information and session data
    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true,
          },
        },
        sessions: true,
      },
      orderBy: {
        registeredAt: 'asc',
      },
      skip,
      take: limit,
    });

    const attendeeInfo: EventAttendeeInfo[] = attendees.map((attendee) => ({
      username: attendee.user.username,
      firstName: attendee.user.firstName,
      lastName: attendee.user.lastName,
      imageUrl: attendee.user.imageUrl,
      email: attendee.user.email,
      totalDuration: attendee.totalDuration,
      isEligible: attendee.isEligible,
      registeredAt: attendee.registeredAt,
      sessionCount: attendee.sessions.length,
    }));

    return {
      message: 'Event attendees retrieved successfully',
      statusCode: 200,
      attendees: attendeeInfo,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
