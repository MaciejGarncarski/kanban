import { BoardAggregate } from 'src/board/domain/board.entity';

export class TeamAggregate {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: Date | null;
  readonly readableId: string;
  boards?: BoardAggregate[];

  constructor(props: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date | null;
    readableId: string;
  }) {
    if (!props) {
      throw new Error('Props are required to create a TeamAggregate ');
    }

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.readableId = props.readableId;
  }
}
