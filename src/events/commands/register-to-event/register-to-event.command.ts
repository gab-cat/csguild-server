export class RegisterToEventCommand {
  constructor(
    public readonly eventSlug: string,
    public readonly username: string,
  ) {}
}
