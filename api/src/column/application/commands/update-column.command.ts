export class UpdateColumnCommand {
  constructor(
    public readonly userId: string,
    public readonly columnId: string,
    public readonly name?: string,
    public readonly position?: number,
  ) {}
}
