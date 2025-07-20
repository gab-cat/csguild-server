import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateFeedbackFormCommand } from './update-feedback-form.command';
import { Prisma } from 'generated/prisma/client';

@Injectable()
@CommandHandler(UpdateFeedbackFormCommand)
export class UpdateFeedbackFormHandler
  implements ICommandHandler<UpdateFeedbackFormCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateFeedbackFormCommand) {
    const { formId, title, fields, isActive } = command.params;

    // Verify feedback form exists
    const existingForm = await this.prisma.eventFeedbackForm.findUnique({
      where: { id: formId },
      include: { event: true },
    });

    if (!existingForm) {
      throw new NotFoundException('Feedback form not found');
    }

    // Prepare update data
    const updateData: Prisma.EventFeedbackFormUpdateInput = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (fields !== undefined) {
      updateData.fields = JSON.parse(JSON.stringify(fields));
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Update the feedback form
    const updatedFeedbackForm = await this.prisma.eventFeedbackForm.update({
      where: { id: formId },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return updatedFeedbackForm;
  }
}
