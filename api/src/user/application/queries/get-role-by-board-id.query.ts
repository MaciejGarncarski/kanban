export class GetRoleByBoardIdQuery {
  constructor(
    public readonly boardId: string,
    public readonly userId: string,
  ) {}
}
