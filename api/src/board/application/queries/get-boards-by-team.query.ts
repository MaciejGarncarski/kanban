export class GetBoardsByTeamQuery {
  constructor(
    public readonly userId: string,
    public readonly readableTeamId: string,
  ) {}
}
