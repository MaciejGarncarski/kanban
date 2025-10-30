import { CardEntity } from 'src/card/domain/card.entity';

export class ColumnEntity {
  readonly id: string;
  readonly boardId: string;
  readonly name: string;
  readonly position: number;
  readonly createdAt: Date | null;
  readonly cards: CardEntity[];

  constructor(props: {
    id: string;
    boardId: string;
    name: string;
    position: number;
    createdAt: Date | null;
    cards: CardEntity[];
  }) {
    if (!props) {
      throw new Error('Props are required to create a ColumnEntity');
    }

    this.id = props.id;
    this.boardId = props.boardId;
    this.name = props.name;
    this.position = props.position;
    this.createdAt = props.createdAt;
    this.cards = props.cards;
  }

  sortCards(): void {
    this.cards.sort((a, b) => a.position - b.position);
  }

  addCard(card: CardEntity): void {
    this.cards.push(card);
  }
}
