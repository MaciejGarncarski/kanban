export class GetUsersByBoardQuery {
  constructor(
    public readonly boardId: string,
    public readonly userId: string,
  ) {}
}
