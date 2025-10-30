import { ColumnEntity } from 'src/column/domain/column.entity';

type BoardProps = {
  id: string;
  name: string;
  description: string | null;
  teamId: string;
  createdAt: Date | null;
  columns?: ColumnEntity[];
};

export class BoardAggregate {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly teamId: string;
  readonly createdAt: Date | null;
  columns?: ColumnEntity[];

  constructor(props: BoardProps) {
    if (!props) {
      throw new Error('Props are required to create a BoardEntity');
    }

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.teamId = props.teamId;
    this.createdAt = props.createdAt;
    this.columns = props.columns;
  }

  addColumn(column: ColumnEntity): void {
    if (!this.columns) {
      this.columns = [];
    }

    this.columns.push(column);
  }

  sortColumns(): void {
    if (!this.columns) return;

    this.columns.sort((a, b) => a.position - b.position);

    this.columns.forEach((column) => column.sortCards());
  }
}
