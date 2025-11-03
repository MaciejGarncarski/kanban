export class GetUsersByTeamIdQuery {
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
  ) {}
}
