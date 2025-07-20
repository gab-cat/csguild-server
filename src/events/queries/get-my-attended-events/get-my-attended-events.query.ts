import { EventFilters, EventPagination } from '../../types/event.types';

export class GetMyAttendedEventsQuery {
  constructor(
    public readonly userSlug: string,
    public readonly filters: EventFilters,
    public readonly pagination: EventPagination,
  ) {}
}
