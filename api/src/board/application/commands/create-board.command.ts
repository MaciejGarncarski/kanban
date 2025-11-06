export class CreateBoardCommand {
  constructor(
    public readonly userId: string,
    public readonly readableTeamId: string,
    public readonly name: string,
    public readonly description: string,
  ) {}
}
