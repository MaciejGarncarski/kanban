export class UpdateBoardCommand {
  constructor(
    public readonly readableBoardId: string,
    public readonly title: string,
    public readonly description?: string,
  ) {}
}
