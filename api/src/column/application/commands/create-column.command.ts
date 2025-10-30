export class CreateColumnCommand {
  constructor(
    public readonly title: string,
    public readonly boardId: string,
  ) {}
}
