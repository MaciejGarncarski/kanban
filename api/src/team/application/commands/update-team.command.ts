export class UpdateTeamCommand {
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly members?: string[],
  ) {}
}
