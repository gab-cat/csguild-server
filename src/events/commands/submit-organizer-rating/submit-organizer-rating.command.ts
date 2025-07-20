import { Command } from '@nestjs/cqrs';

export interface SubmitOrganizerRatingParams {
  eventSlug?: string; // For authenticated routes
  eventId?: string; // For token-based routes
  username: string;
  rating: number;
  comment?: string;
}

export class SubmitOrganizerRatingCommand extends Command<any> {
  constructor(public readonly params: SubmitOrganizerRatingParams) {
    super();
  }
}
