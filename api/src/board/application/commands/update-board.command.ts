export class UpdateBoardCommand {
  constructor(
    public readonly boardId: string,
    public readonly title: string,
    public readonly description?: string,
  ) {}
}
