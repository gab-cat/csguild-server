import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DeleteEventCommand } from './delete-event.command';

@Injectable()
@CommandHandler(DeleteEventCommand)
export class DeleteEventHandler implements ICommandHandler<DeleteEventCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    const { eventSlug, userSlug } = command;

    // Check if event exists and user is the organizer
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    if (existingEvent.organizedBy !== userSlug) {
      throw new ForbiddenException(
        'Only the event organizer can delete this event',
      );
    }

    await this.prisma.event.delete({
      where: { slug: eventSlug },
    });
  }
}
