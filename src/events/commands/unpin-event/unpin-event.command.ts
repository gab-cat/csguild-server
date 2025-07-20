export class UnpinEventCommand {
  constructor(
    public readonly eventSlug: string,
    public readonly adminSlug: string,
  ) {}
}
