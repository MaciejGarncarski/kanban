export class CreateCardCommand {
  constructor(
    public readonly userId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly columnId: string,
    public readonly dueDate?: Date,
    public readonly assignedTo?: string,
  ) {}
}
