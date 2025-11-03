export class CreateBoardCommand {
  constructor(
    public readonly userId: string,
    public readonly teamId: string,
    public readonly name: string,
    public readonly description: string,
  ) {}
}
