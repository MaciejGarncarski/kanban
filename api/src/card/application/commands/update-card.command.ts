export class UpdateCardCommand {
  constructor(
    public readonly userId: string,
    public readonly cardId: string,
    public readonly title: string | undefined,
    public readonly description: string | undefined,
    public readonly dueDate: Date | undefined,
    public readonly assignedTo: string | undefined,
    public readonly position: number | undefined,
    public readonly columnId: string | undefined,
  ) {}
}
