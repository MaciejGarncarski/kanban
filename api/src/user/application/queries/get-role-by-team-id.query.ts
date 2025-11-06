export class GetRoleByTeamIdQuery {
  constructor(
    public readonly readableTeamId: string,
    public readonly userId: string,
  ) {}
}
