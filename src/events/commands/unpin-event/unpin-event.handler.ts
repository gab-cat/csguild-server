import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UnpinEventCommand } from './unpin-event.command';
import { Event } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UnpinEventCommand)
export class UnpinEventHandler implements ICommandHandler<UnpinEventCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UnpinEventCommand): Promise<Event> {
    const { eventSlug } = command;

    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    if (!existingEvent.isPinned) {
      throw new BadRequestException('Event is not pinned');
    }

    // Update event to unpinned
    const updatedEvent = await this.prisma.event.update({
      where: { slug: eventSlug },
      data: { isPinned: false },
    });

    return updatedEvent;
  }
}
