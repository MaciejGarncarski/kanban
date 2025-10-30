import { BadRequestException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { CardEntity } from 'src/card/domain/card.entity';
import { CardRepositoryInterface } from 'src/card/domain/ports/card.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
} from 'src/infrastructure/persistence/db/schema';

type NewCardRecord = {
  title: string;
  description: string;
  columnId: string;
  assignedTo?: string;
  dueDate?: Date;
  position: number;
};

export class CardRepository implements CardRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async getPositionForNewCard(columnId: string): Promise<number> {
    const [positionRecord] = await this.db
      .select()
      .from(cards)
      .where(eq(cards.column_id, columnId))
      .orderBy(desc(cards.position))
      .limit(1);

    return positionRecord ? positionRecord.position + 1 : 0;
  }

  async create(card: NewCardRecord): Promise<CardEntity> {
    const [createdCard] = await this.db
      .insert(cards)
      .values({
        title: card.title,
        description: card.description,
        column_id: card.columnId,
        position: card.position,
        assigned_to: card.assignedTo,
        due_date: card.dueDate,
      })
      .returning();

    const entity = new CardEntity({
      id: createdCard.id,
      title: createdCard.title,
      description: createdCard.description,
      columnId: createdCard.column_id,
      position: createdCard.position,
      assignedTo: createdCard.assigned_to,
      dueDate: createdCard.due_date,
      createdAt: createdCard.created_at,
      updatedAt: createdCard.updated_at,
    });

    return entity;
  }

  async getTeamIdByCardId(cardId: string): Promise<string> {
    const [cardRecord] = await this.db
      .select({ teamId: boards.team_id })
      .from(cards)
      .innerJoin(columns, eq(cards.column_id, columns.id))
      .innerJoin(boards, eq(columns.board_id, boards.id))
      .where(eq(cards.id, cardId));

    if (!cardRecord) {
      throw new BadRequestException('Card not found');
    }

    return cardRecord.teamId;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.db.delete(cards).where(eq(cards.id, cardId));
  }
}
