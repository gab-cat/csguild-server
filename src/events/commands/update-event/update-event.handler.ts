import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UtilsService } from '../../../common/utils/utils.service';
import { UpdateEventCommand } from './update-event.command';
import { Event, Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(UpdateEventCommand)
export class UpdateEventHandler implements ICommandHandler<UpdateEventCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

  async execute(command: UpdateEventCommand): Promise<Event> {
    const { eventSlug, updateEventDto, userSlug } = command;

    // Check if event exists and user is the organizer
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug: eventSlug },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    if (existingEvent.organizedBy !== userSlug) {
      throw new ForbiddenException(
        'Only the event organizer can update this event',
      );
    }

    // Validate dates if provided
    const updateData: Prisma.EventUpdateInput = {};

    if (updateEventDto.title !== undefined) {
      updateData.title = updateEventDto.title;
      // Regenerate slug if title is updated
      updateData.slug = this.utilsService.generateSlug(updateEventDto.title);
    }

    if (updateEventDto.type !== undefined) {
      updateData.type = updateEventDto.type;
    }

    if (updateEventDto.imageUrl !== undefined) {
      updateData.imageUrl = updateEventDto.imageUrl;
    }

    if (updateEventDto.description !== undefined) {
      updateData.description = updateEventDto.description;
    }

    if (updateEventDto.details !== undefined) {
      updateData.details = updateEventDto.details;
    }

    if (updateEventDto.tags !== undefined) {
      updateData.tags = updateEventDto.tags;
    }

    if (updateEventDto.minimumAttendanceMinutes !== undefined) {
      updateData.minimumAttendanceMinutes =
        updateEventDto.minimumAttendanceMinutes;
    }

    if (updateEventDto.startDate !== undefined) {
      const startDate = new Date(updateEventDto.startDate);
      if (startDate < new Date()) {
        throw new BadRequestException('Start date cannot be in the past');
      }
      updateData.startDate = startDate;
    }

    if (updateEventDto.endDate !== undefined) {
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : null;
      updateData.endDate = endDate;

      // Check if end date is after start date
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : existingEvent.startDate;

      if (endDate && endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    try {
      const updatedEvent = await this.prisma.event.update({
        where: { slug: eventSlug },
        data: updateData,
      });

      return updatedEvent;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to update event: ' + error.message,
        );
      }
      throw error;
    }
  }
}
