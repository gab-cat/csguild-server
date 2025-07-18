import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UtilsService } from '../../../common/utils/utils.service';
import { CreateEventCommand } from './create-event.command';
import { Event, Prisma } from '../../../../generated/prisma';

@Injectable()
@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
  ) {}

  async execute(command: CreateEventCommand): Promise<Event> {
    const { createEventDto, organizerSlug } = command;

    // Generate slug from title
    const slug = this.utilsService.generateSlug(createEventDto.title);

    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = createEventDto.endDate
      ? new Date(createEventDto.endDate)
      : null;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    try {
      const event = await this.prisma.event.create({
        data: {
          title: createEventDto.title,
          slug,
          type: createEventDto.type || 'IN_PERSON',
          imageUrl: createEventDto.imageUrl,
          description: createEventDto.description,
          details: createEventDto.details,
          startDate,
          endDate,
          tags: createEventDto.tags || [],
          organizedBy: organizerSlug,
          minimumAttendanceMinutes: createEventDto.minimumAttendanceMinutes,
        },
      });

      return event;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(
          'Failed to create event: ' + error.message,
        );
      }
      throw error;
    }
  }
}
