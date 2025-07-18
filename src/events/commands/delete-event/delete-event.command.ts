export class DeleteEventCommand {
  constructor(
    public readonly eventSlug: string,
    public readonly userSlug: string,
  ) {}
}
