import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { GetEventFeedbackResponsesQuery } from './get-event-feedback-responses.query';
import { Prisma } from '../../../../generated/prisma';

interface FeedbackResponseWithUser {
  id: string;
  responses: any;
  submittedAt: Date;
  user: {
    username: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
  attendee: {
    totalDuration: number;
    isEligible: boolean;
  };
}

interface FeedbackFormField {
  id: string;
  type: string;
  label: string;
  options?: string[];
  required?: boolean;
  description?: string;
  placeholder?: string;
  maxRating?: number;
}

interface FeedbackStatistics {
  totalResponses: number;
  totalAttendees: number;
  responseRate: number;
  fieldStats: Record<string, any>;
}

interface FeedbackResponsesResult {
  message: string;
  statusCode: number;
  responses: FeedbackResponseWithUser[];
  form: {
    id: string;
    title: string;
    fields: FeedbackFormField[];
  } | null;
  statistics: FeedbackStatistics;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
@QueryHandler(GetEventFeedbackResponsesQuery)
export class GetEventFeedbackResponsesHandler
  implements IQueryHandler<GetEventFeedbackResponsesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetEventFeedbackResponsesQuery,
  ): Promise<FeedbackResponsesResult> {
    const { eventSlug, page, limit, search, sortBy, sortOrder } = query;

    // First, find the event
    const event = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
      select: { id: true, title: true },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Find the active feedback form
    const feedbackForm = await this.prisma.eventFeedbackForm.findFirst({
      where: {
        eventId: event.id,
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        fields: true,
      },
    });

    if (!feedbackForm) {
      return {
        message: 'No active feedback form found for this event',
        statusCode: 200,
        responses: [],
        form: null,
        statistics: {
          totalResponses: 0,
          totalAttendees: 0,
          responseRate: 0,
          fieldStats: {},
        },
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    // Build where clause for responses
    const whereClause: Prisma.EventFeedbackResponseWhereInput = {
      formId: feedbackForm.id,
    };

    // Add search functionality
    if (search) {
      whereClause.user = {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Build order by clause
    let orderBy: Prisma.EventFeedbackResponseOrderByWithRelationInput = {};

    switch (sortBy) {
      case 'submittedAt':
        orderBy = { submittedAt: sortOrder };
        break;
      case 'username':
        orderBy = { user: { username: sortOrder } };
        break;
      case 'firstName':
        orderBy = { user: { firstName: sortOrder } };
        break;
      case 'lastName':
        orderBy = { user: { lastName: sortOrder } };
        break;
      default:
        orderBy = { submittedAt: sortOrder };
    }

    // Get total count
    const total = await this.prisma.eventFeedbackResponse.count({
      where: whereClause,
    });

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get responses with user info
    const responses = await this.prisma.eventFeedbackResponse.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true,
          },
        },
        attendee: {
          select: {
            totalDuration: true,
            isEligible: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Get total attendees for response rate calculation
    const totalAttendees = await this.prisma.eventAttendee.count({
      where: { eventId: event.id },
    });

    // Calculate statistics
    const statistics = await this.calculateStatistics(
      feedbackForm.id,
      feedbackForm.fields as unknown as FeedbackFormField[],
      total,
      totalAttendees,
    );

    return {
      message: 'Feedback responses retrieved successfully',
      statusCode: 200,
      responses: responses as FeedbackResponseWithUser[],
      form: {
        id: feedbackForm.id,
        title: feedbackForm.title,
        fields: feedbackForm.fields as unknown as FeedbackFormField[],
      },
      statistics,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  }

  private async calculateStatistics(
    formId: string,
    fields: FeedbackFormField[],
    totalResponses: number,
    totalAttendees: number,
  ): Promise<FeedbackStatistics> {
    // Get all responses for statistical analysis
    const allResponses = await this.prisma.eventFeedbackResponse.findMany({
      where: { formId },
      select: { responses: true },
    });

    const fieldStats: Record<string, any> = {};

    // Calculate statistics for each field
    fields.forEach((field) => {
      const fieldId = field.id;
      const fieldType = field.type;
      const answers = allResponses
        .map((response) => (response.responses as any)[fieldId])
        .filter(
          (answer) => answer !== undefined && answer !== null && answer !== '',
        );

      const stats: any = {
        totalAnswers: answers.length,
        responseRate:
          totalResponses > 0 ? (answers.length / totalResponses) * 100 : 0,
      };

      switch (fieldType) {
        case 'radio':
        case 'checkbox':
          // For radio buttons and checkboxes, count each option
          const optionCounts: Record<string, number> = {};

          answers.forEach((answer) => {
            if (Array.isArray(answer)) {
              // For checkboxes (multiple selections)
              answer.forEach((option) => {
                optionCounts[option] = (optionCounts[option] || 0) + 1;
              });
            } else if (typeof answer === 'string') {
              // For radio buttons and checkbox strings like "Option1,Option2"
              if (answer.includes(',')) {
                answer.split(',').forEach((option) => {
                  const trimmedOption = option.trim();
                  optionCounts[trimmedOption] =
                    (optionCounts[trimmedOption] || 0) + 1;
                });
              } else {
                optionCounts[answer] = (optionCounts[answer] || 0) + 1;
              }
            }
          });

          stats.optionCounts = optionCounts;
          stats.mostPopular = Object.entries(optionCounts).reduce(
            (max, [option, count]) =>
              count > max.count ? { option, count } : max,
            { option: '', count: 0 },
          );
          break;

        case 'rating':
          // For rating fields, calculate average, min, max, and distribution
          const numericAnswers = answers
            .map((answer) => parseFloat(answer))
            .filter((num) => !isNaN(num));

          if (numericAnswers.length > 0) {
            stats.average =
              numericAnswers.reduce((sum, val) => sum + val, 0) /
              numericAnswers.length;
            stats.min = Math.min(...numericAnswers);
            stats.max = Math.max(...numericAnswers);

            // Rating distribution
            const distribution: Record<string, number> = {};
            numericAnswers.forEach((rating) => {
              distribution[rating.toString()] =
                (distribution[rating.toString()] || 0) + 1;
            });
            stats.distribution = distribution;
          }
          break;

        case 'text':
        case 'textarea':
          // For text fields, provide word count and common words
          const textAnswers = answers.filter(
            (answer) => typeof answer === 'string',
          );

          if (textAnswers.length > 0) {
            const totalWords = textAnswers.reduce((count, text) => {
              return (
                count +
                text.split(/\s+/).filter((word) => word.length > 0).length
              );
            }, 0);

            stats.averageWordCount = totalWords / textAnswers.length;
            stats.totalWords = totalWords;

            // Get sample responses (first 3)
            stats.sampleResponses = textAnswers.slice(0, 3);
          }
          break;

        default:
          // For other field types, just provide basic counts
          stats.sampleAnswers = answers.slice(0, 5);
      }

      fieldStats[fieldId] = {
        fieldLabel: field.label,
        fieldType: field.type,
        ...stats,
      };
    });

    return {
      totalResponses,
      totalAttendees,
      responseRate:
        totalAttendees > 0 ? (totalResponses / totalAttendees) * 100 : 0,
      fieldStats,
    };
  }
}
