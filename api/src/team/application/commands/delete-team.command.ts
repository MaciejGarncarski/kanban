export class DeleteTeamCommand {
  constructor(
    public readonly userId: string,
    public readonly teamId: string,
  ) {}
}
