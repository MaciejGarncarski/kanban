export class DeleteBoardCommand {
  constructor(
    public readonly readableBoardId: string,
    public readonly userId: string,
  ) {}
}
