export class DeleteCardCommand {
  constructor(
    public readonly userId: string,
    public readonly cardId: string,
  ) {}
}
