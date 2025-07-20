export class GetEventAttendeesQuery {
  constructor(
    public readonly eventId: string,
    public readonly pagination: {
      page: number;
      limit: number;
    } = { page: 1, limit: 50 },
  ) {}
}
