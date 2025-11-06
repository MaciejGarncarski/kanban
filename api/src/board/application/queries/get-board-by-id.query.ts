export class GetBoardByIdQuery {
  constructor(
    public readonly userId: string,
    public readonly readableBoardId: string,
  ) {}
}
