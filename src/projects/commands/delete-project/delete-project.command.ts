export class DeleteProjectCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}
