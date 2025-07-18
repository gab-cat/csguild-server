import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetFeedbackFormQuery } from './get-feedback-form.query';

@Injectable()
@QueryHandler(GetFeedbackFormQuery)
export class GetFeedbackFormHandler
  implements IQueryHandler<GetFeedbackFormQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFeedbackFormQuery) {
    const { eventId, userId } = query;

    // Find the active feedback form for the event
    const feedbackForm = await this.prisma.eventFeedbackForm.findFirst({
      where: {
        eventId,
        isActive: true,
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!feedbackForm) {
      throw new NotFoundException(
        'No active feedback form found for this event',
      );
    }

    // If userId is provided, check if user is eligible and hasn't already responded
    if (userId) {
      // Check if user has already submitted feedback
      const existingResponse =
        await this.prisma.eventFeedbackResponse.findUnique({
          where: {
            formId_userId: {
              formId: feedbackForm.id,
              userId,
            },
          },
        });

      if (existingResponse) {
        return {
          ...feedbackForm,
          hasSubmitted: true,
        };
      }
    }

    return {
      ...feedbackForm,
      hasSubmitted: false,
    };
  }
}
