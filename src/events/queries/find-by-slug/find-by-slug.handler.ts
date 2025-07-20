import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { FindEventBySlugQuery } from './find-by-slug.query';
import { EventDetailResponse } from '../../types/event.types';

@Injectable()
@QueryHandler(FindEventBySlugQuery)
export class FindEventBySlugHandler
  implements IQueryHandler<FindEventBySlugQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: FindEventBySlugQuery): Promise<EventDetailResponse> {
    const { slug } = query;

    const event = await this.prisma.event.findUnique({
      where: { slug },
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
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }
}
