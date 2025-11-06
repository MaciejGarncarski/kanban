export class GetRoleByBoardIdQuery {
  constructor(
    public readonly readableBoardId: string,
    public readonly userId: string,
  ) {}
}
