export class GetUsersByTeamIdQuery {
  constructor(
    public readonly readableTeamId: string,
    public readonly userId: string,
  ) {}
}
