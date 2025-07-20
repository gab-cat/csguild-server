import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SendFeedbackNotificationCommand } from '../../../common/email/commands';
import { FeedbackTokenService } from '../../utils';
import { ToggleSessionCommand } from './toggle-session.command';

@Injectable()
@CommandHandler(ToggleSessionCommand)
export class ToggleSessionHandler
  implements ICommandHandler<ToggleSessionCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
    private readonly feedbackTokenService: FeedbackTokenService,
  ) {}

  async execute(command: ToggleSessionCommand) {
    const { rfidId, eventId } = command;

    // First, find the user by RFID
    const user = await this.prisma.user.findUnique({
      where: { rfidId },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found with the provided RFID');
    }

    // Check if the event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Find or create the event attendee record
    let attendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: user.username,
        },
      },
      include: {
        sessions: {
          where: {
            endedAt: null, // Only get active sessions (not ended)
          },
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    });

    // If no attendee record exists, create one
    if (!attendee) {
      attendee = await this.prisma.eventAttendee.create({
        data: {
          eventId,
          userId: user.username,
        },
        include: {
          sessions: true,
        },
      });
    }

    // Check if there's an active session (not ended)
    const activeSession = attendee.sessions.find((session) => !session.endedAt);

    if (activeSession) {
      // End the session (check-out)
      const endedAt = new Date();
      const duration = Math.floor(
        (endedAt.getTime() - activeSession.startedAt.getTime()) / (1000 * 60),
      ); // Duration in minutes

      const updatedSession = await this.prisma.eventSession.update({
        where: { id: activeSession.id },
        data: {
          endedAt,
          duration,
        },
      });

      // Update total duration in attendee record
      const newTotalDuration = attendee.totalDuration + duration;
      const isEligible = event.minimumAttendanceMinutes
        ? newTotalDuration >= event.minimumAttendanceMinutes
        : true;

      // Check if attendee just became eligible (wasn't eligible before but is now)
      const justBecameEligible = !attendee.isEligible && isEligible;

      const updatedAttendee = await this.prisma.eventAttendee.update({
        where: { id: attendee.id },
        data: {
          totalDuration: newTotalDuration,
          isEligible,
        },
      });

      // If attendee just became eligible and hasn't been notified, send feedback notification
      if (justBecameEligible && !updatedAttendee.notifiedFeedback) {
        await this.sendFeedbackNotification(event, user);

        // Mark as notified
        await this.prisma.eventAttendee.update({
          where: { id: attendee.id },
          data: {
            notifiedFeedback: true,
          },
        });
      }

      return {
        action: 'check-out',
        session: updatedSession,
        totalDuration: newTotalDuration,
        isEligible,
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } else {
      // Start a new session (check-in)
      const newSession = await this.prisma.eventSession.create({
        data: {
          attendeeId: attendee.id,
        },
      });

      return {
        action: 'check-in',
        session: newSession,
        totalDuration: attendee.totalDuration,
        isEligible: attendee.isEligible,
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    }
  }

  private async sendFeedbackNotification(event: any, user: any): Promise<void> {
    try {
      // Find the active feedback form for this event
      const feedbackForm = await this.prisma.eventFeedbackForm.findFirst({
        where: {
          eventId: event.id,
          isActive: true,
        },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      });

      if (!feedbackForm) {
        // No feedback form exists, skip notification
        return;
      }

      // Generate feedback URL with secure token
      const feedbackUrl = this.feedbackTokenService.generateFeedbackUrl(
        event.id,
        user.username,
        feedbackForm.id,
        event.slug,
      );

      // Send feedback notification email
      await this.commandBus.execute(
        new SendFeedbackNotificationCommand({
          email: user.email,
          firstName: user.firstName,
          eventTitle: event.title,
          feedbackUrl,
          organizerName: `${feedbackForm.event.organizer.firstName} ${feedbackForm.event.organizer.lastName}`,
        }),
      );
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to send feedback notification:', error);
    }
  }
}
