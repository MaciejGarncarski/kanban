import { CardEntity } from '../card.entity.js';

export interface CardRepositoryInterface {
  findAllByColumnId(columnId: string): Promise<CardEntity[]>;
  findByTitleAndColumnId(
    title: string,
    columnId: string,
  ): Promise<CardEntity | null>;
  findById(cardId: string): Promise<CardEntity | null>;
  create(card: {
    title: string;
    description: string;
    columnId: string;
    assignedTo?: string;
    dueDate?: Date;
  }): Promise<CardEntity>;
  getPositionForNewCard(columnId: string): Promise<number>;
  getTeamIdByCardId(cardId: string): Promise<string>;
  deleteCard(cardId: string): Promise<void>;
  updateCard(card: CardEntity): Promise<CardEntity>;
  getReadableTeamIdByCardId(cardId: string): Promise<string>;
}
