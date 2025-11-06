import { BadRequestException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { CardEntity } from 'src/card/domain/card.entity';
import { CardRepositoryInterface } from 'src/card/domain/ports/card.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
  comments,
  teams,
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

  async findById(cardId: string): Promise<CardEntity | null> {
    const [cardRecord] = await this.db
      .select()
      .from(cards)
      .where(eq(cards.id, cardId));

    if (!cardRecord) {
      return null;
    }

    const entity = new CardEntity({
      id: cardRecord.id,
      title: cardRecord.title,
      description: cardRecord.description,
      columnId: cardRecord.column_id,
      position: cardRecord.position,
      assignedTo: cardRecord.assigned_to,
      dueDate: cardRecord.due_date,
      createdAt: cardRecord.created_at,
      updatedAt: cardRecord.updated_at,
    });

    return entity;
  }

  async findByTitleAndColumnId(
    title: string,
    columnId: string,
  ): Promise<CardEntity | null> {
    const [cardRecord] = await this.db
      .select()
      .from(cards)
      .where(and(eq(cards.title, title), eq(cards.column_id, columnId)));

    if (!cardRecord) {
      return null;
    }

    const entity = new CardEntity({
      id: cardRecord.id,
      title: cardRecord.title,
      description: cardRecord.description,
      columnId: cardRecord.column_id,
      position: cardRecord.position,
      assignedTo: cardRecord.assigned_to,
      dueDate: cardRecord.due_date,
      createdAt: cardRecord.created_at,
      updatedAt: cardRecord.updated_at,
    });

    return entity;
  }
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
      .select()
      .from(cards)
      .innerJoin(columns, eq(cards.column_id, columns.id))
      .innerJoin(boards, eq(columns.board_id, boards.id))
      .innerJoin(teams, eq(teams.id, boards.team_id))
      .where(eq(cards.id, cardId));

    if (!cardRecord) {
      throw new BadRequestException('Card not found');
    }

    return cardRecord.teams.readable_id;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(comments).where(eq(comments.card_id, cardId));
      await tx.delete(cards).where(eq(cards.id, cardId));
    });
  }

  async findAllByColumnId(columnId: string): Promise<CardEntity[]> {
    const cardRecords = await this.db
      .select()
      .from(cards)
      .where(eq(cards.column_id, columnId))
      .orderBy(cards.position);

    return cardRecords.map(
      (cardRecord) =>
        new CardEntity({
          id: cardRecord.id,
          title: cardRecord.title,
          description: cardRecord.description,
          columnId: cardRecord.column_id,
          position: cardRecord.position,
          assignedTo: cardRecord.assigned_to,
          dueDate: cardRecord.due_date,
          createdAt: cardRecord.created_at,
          updatedAt: cardRecord.updated_at,
        }),
    );
  }

  async updateCard(card: CardEntity): Promise<CardEntity> {
    const [updatedCard] = await this.db
      .update(cards)
      .set({
        title: card.title,
        description: card.description,
        column_id: card.columnId,
        position: card.position,
        assigned_to: card.assignedTo,
        due_date: card.dueDate,
      })
      .where(eq(cards.id, card.id))
      .returning();

    const entity = new CardEntity({
      id: updatedCard.id,
      title: updatedCard.title,
      description: updatedCard.description,
      columnId: updatedCard.column_id,
      position: updatedCard.position,
      assignedTo: updatedCard.assigned_to,
      dueDate: updatedCard.due_date,
      createdAt: updatedCard.created_at,
      updatedAt: updatedCard.updated_at,
    });

    return entity;
  }
}
