import { UpdateEventDto } from '../../dto/request';

export class UpdateEventCommand {
  constructor(
    public readonly eventSlug: string,
    public readonly updateEventDto: UpdateEventDto,
    public readonly userSlug: string,
  ) {}
}
