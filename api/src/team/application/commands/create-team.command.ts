export class CreateTeamCommand {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly members: string[],
  ) {}
}
