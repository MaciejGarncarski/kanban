type BoardProps = {
  id: string;
  name: string;
  description: string;
  teamId: string;
  createdAt: Date | null;
};

export class BoardEntity {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly teamId: string;
  readonly createdAt: Date | null;

  constructor(props: BoardProps) {
    if (!props) {
      throw new Error('Props are required to create a BoardEntity');
    }

    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.teamId = props.teamId;
    this.createdAt = props.createdAt;
  }

  createNew(
    id: string,
    name: string,
    description: string,
    teamId: string,
    createdAt: Date,
  ): BoardEntity {
    return new BoardEntity({ id, name, description, teamId, createdAt });
  }
}
