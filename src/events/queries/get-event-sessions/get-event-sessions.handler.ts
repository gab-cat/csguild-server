import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetEventSessionsQuery } from './get-event-sessions.query';

@Injectable()
@QueryHandler(GetEventSessionsQuery)
export class GetEventSessionsHandler
  implements IQueryHandler<GetEventSessionsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEventSessionsQuery) {
    const { eventSlug } = query;

    // Find the event by slug
    const event = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Get all attendees with their sessions for this event
    const attendeesWithSessions = await this.prisma.eventAttendee.findMany({
      where: {
        eventId: event.id,
      },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            rfidId: true,
          },
        },
        sessions: {
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    });

    return {
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        minimumAttendanceMinutes: event.minimumAttendanceMinutes,
      },
      attendees: attendeesWithSessions.map((attendee) => ({
        id: attendee.id,
        user: attendee.user,
        totalDuration: attendee.totalDuration,
        isEligible: attendee.isEligible,
        registeredAt: attendee.registeredAt,
        sessions: attendee.sessions.map((session) => ({
          id: session.id,
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          duration: session.duration,
        })),
        activeSession: attendee.sessions.find((session) => !session.endedAt),
      })),
    };
  }
}
