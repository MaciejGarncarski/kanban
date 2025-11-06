export class DeleteTeamCommand {
  constructor(
    public readonly userId: string,
    public readonly readableTeamId: string,
  ) {}
}
