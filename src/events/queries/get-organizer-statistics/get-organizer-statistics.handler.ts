import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetOrganizerStatisticsQuery } from './get-organizer-statistics.query';

export interface OrganizerStatistics {
  totalEventsOrganized: number;
  totalAttendees: number;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  recentEvents: Array<{
    id: string;
    title: string;
    slug: string;
    startDate: Date;
    endDate: Date | null;
    attendeeCount: number;
    averageRating: number;
    totalRatings: number;
  }>;
  organizer: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

export interface OrganizerStatisticsResponse {
  message: string;
  statusCode: number;
  statistics: OrganizerStatistics;
}

@Injectable()
@QueryHandler(GetOrganizerStatisticsQuery)
export class GetOrganizerStatisticsHandler
  implements IQueryHandler<GetOrganizerStatisticsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetOrganizerStatisticsQuery,
  ): Promise<OrganizerStatisticsResponse> {
    const { organizerUsername } = query;

    // Check if organizer exists
    const organizer = await this.prisma.user.findUnique({
      where: { username: organizerUsername },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
      },
    });

    if (!organizer) {
      throw new NotFoundException(
        `Organizer with username '${organizerUsername}' not found`,
      );
    }

    // Get total events organized
    const totalEventsOrganized = await this.prisma.event.count({
      where: { organizedBy: organizerUsername },
    });

    // Get total attendees across all events
    const totalAttendeesResult = await this.prisma.eventAttendee.aggregate({
      where: {
        event: {
          organizedBy: organizerUsername,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalAttendees = totalAttendeesResult._count.id;

    // Get all ratings for events organized by this user
    const allRatings = await this.prisma.eventOrganizerRating.findMany({
      where: {
        event: {
          organizedBy: organizerUsername,
        },
      },
      select: {
        rating: true,
      },
    });

    const totalRatings = allRatings.length;
    const averageRating =
      totalRatings > 0
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
        : 0;

    // Calculate rating distribution
    const ratingDistribution: Record<string, number> = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
    };

    allRatings.forEach((rating) => {
      ratingDistribution[rating.rating.toString()]++;
    });

    // Get 5 most recent events with their statistics
    const recentEventsData = await this.prisma.event.findMany({
      where: { organizedBy: organizerUsername },
      include: {
        attendees: {
          select: { id: true },
        },
        organizerRatings: {
          select: { rating: true },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    const recentEvents = recentEventsData.map((event) => {
      const eventRatings = event.organizerRatings.map((r) => r.rating);
      const eventAverageRating =
        eventRatings.length > 0
          ? eventRatings.reduce((sum, rating) => sum + rating, 0) /
            eventRatings.length
          : 0;

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        attendeeCount: event.attendees.length,
        averageRating: Math.round(eventAverageRating * 100) / 100, // Round to 2 decimal places
        totalRatings: eventRatings.length,
      };
    });

    const statistics: OrganizerStatistics = {
      totalEventsOrganized,
      totalAttendees,
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
      ratingDistribution,
      recentEvents,
      organizer,
    };

    return {
      message: 'Organizer statistics retrieved successfully',
      statusCode: 200,
      statistics,
    };
  }
}
