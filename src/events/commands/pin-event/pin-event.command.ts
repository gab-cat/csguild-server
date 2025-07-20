export class PinEventCommand {
  constructor(
    public readonly eventSlug: string,
    public readonly adminSlug: string,
  ) {}
}
