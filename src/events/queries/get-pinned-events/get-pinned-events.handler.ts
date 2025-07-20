import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetPinnedEventsQuery } from './get-pinned-events.query';
import { EventDetailResponse } from '../../types/event.types';

@Injectable()
@QueryHandler(GetPinnedEventsQuery)
export class GetPinnedEventsHandler
  implements IQueryHandler<GetPinnedEventsQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<EventDetailResponse[]> {
    // Get all pinned events ordered by creation date (newest first)
    const events = await this.prisma.event.findMany({
      where: {
        isPinned: true,
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return events;
  }
}
