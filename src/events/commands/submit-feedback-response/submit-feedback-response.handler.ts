import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SubmitFeedbackResponseCommand } from './submit-feedback-response.command';

@Injectable()
@CommandHandler(SubmitFeedbackResponseCommand)
export class SubmitFeedbackResponseHandler
  implements ICommandHandler<SubmitFeedbackResponseCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SubmitFeedbackResponseCommand) {
    const { formId, userId, responses } = command.params;

    // Find the feedback form and ensure it's active
    const feedbackForm = await this.prisma.eventFeedbackForm.findUnique({
      where: { id: formId },
      include: {
        event: {
          include: {
            attendees: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!feedbackForm) {
      throw new NotFoundException('Feedback form not found');
    }

    if (!feedbackForm.isActive) {
      throw new BadRequestException('Feedback form is no longer active');
    }

    // Check if user is an eligible attendee
    const attendee = feedbackForm.event.attendees[0];
    if (!attendee) {
      throw new ForbiddenException(
        'You must be an attendee of this event to submit feedback',
      );
    }

    if (!attendee.isEligible) {
      throw new ForbiddenException(
        'You have not met the minimum attendance requirement to provide feedback',
      );
    }

    // Check if user has already submitted feedback for this form
    const existingResponse = await this.prisma.eventFeedbackResponse.findUnique(
      {
        where: {
          formId_userId: {
            formId,
            userId,
          },
        },
      },
    );

    if (existingResponse) {
      throw new BadRequestException(
        'You have already submitted feedback for this event',
      );
    }

    // Create the feedback response
    const feedbackResponse = await this.prisma.eventFeedbackResponse.create({
      data: {
        formId,
        userId,
        attendeeId: attendee.id,
        responses: JSON.parse(JSON.stringify(responses)),
      },
    });

    return feedbackResponse;
  }
}
