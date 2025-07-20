import { CreateEventDto } from '../../dto/request';

export class CreateEventCommand {
  constructor(
    public readonly createEventDto: CreateEventDto,
    public readonly organizerSlug: string,
  ) {}
}
