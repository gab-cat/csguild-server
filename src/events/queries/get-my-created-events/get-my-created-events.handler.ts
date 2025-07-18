import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetMyCreatedEventsQuery } from './get-my-created-events.query';
import { EventListResponse } from '../../types/event.types';
import { Prisma } from '../../../../generated/prisma';

@Injectable()
@QueryHandler(GetMyCreatedEventsQuery)
export class GetMyCreatedEventsHandler
  implements IQueryHandler<GetMyCreatedEventsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMyCreatedEventsQuery): Promise<EventListResponse> {
    const { userSlug, filters, pagination } = query;
    const { page, limit, sortBy, sortOrder } = pagination;

    // Build where clause for events created by the user
    const whereClause: Prisma.EventWhereInput = {
      organizedBy: userSlug,
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

    // Get events with organizer info
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
      },
      orderBy,
      skip,
      take: limit,
    });

    return {
      message: 'Created events retrieved successfully',
      statusCode: 200,
      events,
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
