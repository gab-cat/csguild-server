export class ToggleSessionCommand {
  constructor(
    public readonly rfidId: string,
    public readonly eventId: string,
  ) {}
}
