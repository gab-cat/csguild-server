import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CheckFeedbackResponseQuery } from './check-feedback-response.query';

@Injectable()
@QueryHandler(CheckFeedbackResponseQuery)
export class CheckFeedbackResponseHandler
  implements IQueryHandler<CheckFeedbackResponseQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CheckFeedbackResponseQuery) {
    const { slug, username } = query;

    // Find the active feedback form for the event
    const feedbackForm = await this.prisma.eventFeedbackForm.findFirst({
      where: {
        isActive: true,
        event: {
          slug,
        },
      },
      select: {
        id: true,
      },
    });

    if (!feedbackForm) {
      return {
        hasForm: false,
        hasSubmitted: false,
        formId: null,
        submittedAt: null,
      };
    }

    // Check if user has already submitted feedback for this specific event
    const existingResponse = await this.prisma.eventFeedbackResponse.findFirst({
      where: {
        formId: feedbackForm.id,
        userId: username,
      },
      select: {
        submittedAt: true,
      },
    });

    return {
      hasForm: true,
      hasSubmitted: !!existingResponse,
      formId: feedbackForm.id,
      submittedAt: existingResponse?.submittedAt || null,
    };
  }
}
