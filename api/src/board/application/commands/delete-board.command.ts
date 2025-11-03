export class DeleteBoardCommand {
  constructor(
    public readonly boardId: string,
    public readonly userId: string,
  ) {}
}
