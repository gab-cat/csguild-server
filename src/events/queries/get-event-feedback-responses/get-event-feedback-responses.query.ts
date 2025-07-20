export class GetEventFeedbackResponsesQuery {
  constructor(
    public readonly eventSlug: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly search?: string,
    public readonly sortBy:
      | 'submittedAt'
      | 'username'
      | 'firstName'
      | 'lastName' = 'submittedAt',
    public readonly sortOrder: 'asc' | 'desc' = 'desc',
  ) {}
}
