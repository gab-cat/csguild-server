import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { PinEventCommand } from './pin-event.command';
import { Event } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(PinEventCommand)
export class PinEventHandler implements ICommandHandler<PinEventCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PinEventCommand): Promise<Event> {
    const { eventSlug } = command;

    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    if (existingEvent.isPinned) {
      throw new BadRequestException('Event is already pinned');
    }

    // Update event to pinned
    const updatedEvent = await this.prisma.event.update({
      where: { slug: eventSlug },
      data: { isPinned: true },
    });

    return updatedEvent;
  }
}
