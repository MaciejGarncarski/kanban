import { CardEntity } from 'src/card/domain/card.entity';

export interface CardRepositoryInterface {
  create(card: {
    title: string;
    description: string;
    columnId: string;
    assignedTo?: string;
    dueDate?: Date;
  }): Promise<CardEntity>;
  getPositionForNewCard(columnId: string): Promise<number>;
}
