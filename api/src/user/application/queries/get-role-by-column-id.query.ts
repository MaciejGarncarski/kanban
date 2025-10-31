export class GetRoleByColumnIdQuery {
  constructor(
    public readonly columnId: string,
    public readonly userId: string,
  ) {}
}
