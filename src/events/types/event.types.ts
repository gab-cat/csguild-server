import { Event, User } from '../../../generated/prisma';
import { EventType } from '../enums';

export interface EventFilters {
  search?: string;
  tags?: string[];
  organizerSlug?: string;
  pinned?: boolean;
  type?: EventType;
}

export interface EventPagination {
  page: number;
  limit: number;
  sortBy: 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface EventListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type EventDetailResponse = Event & {
  organizer: Pick<User, 'username' | 'firstName' | 'lastName' | 'imageUrl'>;
};

export interface EventListResponse {
  message: string;
  statusCode: number;
  events: EventDetailResponse[];
  meta: EventListMeta;
}
