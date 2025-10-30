export class GetRoleByTeamIdQuery {
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
  ) {}
}
