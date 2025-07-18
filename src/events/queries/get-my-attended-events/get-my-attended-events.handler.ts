import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetMyAttendedEventsQuery } from './get-my-attended-events.query';
import { EventListResponse } from '../../types/event.types';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetMyAttendedEventsQuery)
export class GetMyAttendedEventsHandler
  implements IQueryHandler<GetMyAttendedEventsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyAttendedEventsQuery): Promise<EventListResponse> {
    const { userSlug, filters, pagination } = query;
    const { page, limit, sortBy, sortOrder } = pagination;

    // Build where clause for events that the user has attended
    const whereClause: Prisma.EventWhereInput = {
      attendees: {
        some: {
          userId: userSlug,
        },
      },
    };

    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { details: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.tags && filters.tags.length > 0) {
      whereClause.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.organizerSlug) {
      whereClause.organizedBy = filters.organizerSlug;
    }

    if (filters.pinned !== undefined) {
      whereClause.isPinned = filters.pinned;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    // Build order by clause
    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Get total count for pagination
    const total = await this.prisma.event.count({ where: whereClause });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get events with organizer info and detailed attendee data
    const events = await this.prisma.event.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            email: true,
          },
        },
        attendees: {
          where: {
            userId: userSlug,
          },
          include: {
            sessions: {
              orderBy: {
                startedAt: 'desc',
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Transform events to include attendee details
    const eventsWithAttendeeInfo = events.map((event) => {
      const attendee = event.attendees[0]; // There should only be one attendee (the current user)

      return {
        ...event,
        attendeeInfo: attendee
          ? {
              totalDuration: attendee.totalDuration,
              isEligible: attendee.isEligible,
              registeredAt: attendee.registeredAt,
              sessionCount: attendee.sessions.length,
              sessions: attendee.sessions.map((session) => ({
                id: session.id,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                duration: session.duration,
              })),
              hasCompletedMinimumAttendance: event.minimumAttendanceMinutes
                ? attendee.totalDuration >= event.minimumAttendanceMinutes
                : true,
            }
          : null,
        attendees: undefined as any, // Remove the raw attendees data
      };
    });

    return {
      message: 'Attended events retrieved successfully',
      statusCode: 200,
      events: eventsWithAttendeeInfo,
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
