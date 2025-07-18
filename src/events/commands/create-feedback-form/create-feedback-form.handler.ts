import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateFeedbackFormCommand } from './create-feedback-form.command';

@Injectable()
@CommandHandler(CreateFeedbackFormCommand)
export class CreateFeedbackFormHandler
  implements ICommandHandler<CreateFeedbackFormCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateFeedbackFormCommand) {
    const { eventId, title, fields } = command.params;

    // Verify event exists
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Create the feedback form
    const feedbackForm = await this.prisma.eventFeedbackForm.create({
      data: {
        eventId,
        title: title || 'Event Feedback',
        fields: JSON.parse(JSON.stringify(fields)),
      },
    });

    return feedbackForm;
  }
}
