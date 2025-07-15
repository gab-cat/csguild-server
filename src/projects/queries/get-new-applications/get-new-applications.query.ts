export class GetNewApplicationsQuery {
  constructor(
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {}
}
