import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RegisterToEventCommand } from './register-to-event.command';
import { SendEventRegistrationConfirmationCommand } from '../../../common/email/commands';
import { EventAttendee, Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(RegisterToEventCommand)
export class RegisterToEventHandler
  implements ICommandHandler<RegisterToEventCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RegisterToEventCommand): Promise<EventAttendee> {
    const { eventSlug, username } = command;

    // Check if event exists
    const event = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!event) {
      throw new NotFoundException(`Event with slug '${eventSlug}' not found`);
    }

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username '${username}' not found`);
    }

    // Check if user is already registered for this event
    const existingAttendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.username,
        },
      },
    });

    if (existingAttendee) {
      throw new ConflictException('User is already registered for this event');
    }

    // Check if event has already ended
    if (event.endDate && event.endDate < new Date()) {
      throw new BadRequestException(
        'Cannot register for an event that has already ended',
      );
    }

    try {
      const attendee = await this.prisma.eventAttendee.create({
        data: {
          eventId: event.id,
          userId: user.username,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              endDate: true,
            },
          },
          user: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Send confirmation email
      await this.commandBus.execute(
        new SendEventRegistrationConfirmationCommand({
          email: attendee.user.email,
          firstName: attendee.user.firstName,
          username: attendee.user.username,
          eventTitle: attendee.event.title,
          eventSlug: attendee.event.slug,
          eventStartDate: attendee.event.startDate,
          eventEndDate: attendee.event.endDate,
        }),
      );

      return attendee;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'User is already registered for this event',
          );
        }
        throw new BadRequestException(
          'Failed to register for event: ' + error.message,
        );
      }
      throw error;
    }
  }
}
