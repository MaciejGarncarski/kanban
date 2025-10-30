export class CardEntity {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly position: number;
  readonly assignedTo: string | null;
  readonly columnId: string;
  readonly dueDate: Date | null;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;

  constructor(props: {
    id: string;
    title: string;
    description: string | null;
    position: number;
    columnId: string;
    assignedTo: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    dueDate: Date | null;
  }) {
    if (!props) {
      throw new Error('Props are required to create a CardEntity');
    }

    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.position = props.position;
    this.assignedTo = props.assignedTo;
    this.columnId = props.columnId;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
