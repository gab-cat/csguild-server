export class GetFeedbackFormQuery {
  constructor(
    public readonly eventId: string,
    public readonly userId?: string,
  ) {}
}
