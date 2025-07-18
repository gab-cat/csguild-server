import { EventFilters, EventPagination } from '../../types/event.types';

export class FindAllEventsQuery {
  constructor(
    public readonly filters: EventFilters,
    public readonly pagination: EventPagination,
  ) {}
}
