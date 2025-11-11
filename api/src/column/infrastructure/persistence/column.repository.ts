import { BadRequestException, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { CardEntity } from 'src/card/domain/card.entity';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { ColumnRepositoryInterface } from 'src/column/domain/ports/column.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
  teams,
} from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class ColumnRepository implements ColumnRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async findById(columnId: string): Promise<ColumnEntity | null> {
    const records = await this.db
      .select({
        column: columns,
        card: cards,
      })
      .from(columns)
      .leftJoin(cards, eq(columns.id, cards.column_id))
      .where(eq(columns.id, columnId));

    if (records.length === 0) {
      return null;
    }

    const recordMap = new Map<string, ColumnEntity>();

    for (const { column: colRecord, card: cardRecord } of records) {
      let columnEntity = recordMap.get(colRecord.id);
      if (!columnEntity) {
        columnEntity = new ColumnEntity({
          id: colRecord.id,
          boardId: colRecord.board_id,
          name: colRecord.name,
          position: colRecord.position,
          createdAt: colRecord.created_at ?? new Date(),
          cards: [],
        });
        recordMap.set(colRecord.id, columnEntity);
      }

      if (cardRecord && cardRecord.id) {
        columnEntity.cards.push(
          new CardEntity({
            id: cardRecord.id,
            columnId: cardRecord.column_id,
            title: cardRecord.title,
            description: cardRecord.description,
            position: cardRecord.position,
            createdAt: cardRecord.created_at ?? new Date(),
            assignedTo: cardRecord.assigned_to ?? null,
            dueDate: cardRecord.due_date ?? null,
            updatedAt: cardRecord.updated_at ?? null,
          }),
        );
      }
    }

    const record = recordMap.get(columnId);

    if (!record) {
      return null;
    }

    return record;
  }

  async save(column: ColumnEntity): Promise<void> {
    await this.db
      .update(columns)
      .set({
        name: column.name,
        position: column.position,
      })
      .where(eq(columns.id, column.id));
  }

  async checkMaxColumns(readableBoardId: string): Promise<boolean> {
    const boardRecord = await this.db
      .select()
      .from(boards)
      .where(eq(boards.readable_id, readableBoardId))
      .limit(1);

    if (!boardRecord || boardRecord.length === 0) {
      throw new Error('Board not found');
    }

    const boardDbId = boardRecord[0].id;

    const [columnCount] = await this.db
      .select({ count: count() })
      .from(columns)
      .where(eq(columns.board_id, boardDbId));

    return columnCount.count >= 6;
  }

  async createColumn(
    readableBoardId: string,
    name: string,
  ): Promise<ColumnEntity> {
    const boardRecord = await this.db
      .select()
      .from(boards)
      .where(eq(boards.readable_id, readableBoardId))
      .limit(1);

    if (!boardRecord || boardRecord.length === 0) {
      throw new Error('Board not found');
    }

    const boardDbId = boardRecord[0].id;

    const [positionRecords] = await this.db
      .select()
      .from(columns)
      .where(eq(columns.board_id, boardDbId))
      .orderBy(desc(columns.position))
      .limit(1);

    const [created] = await this.db
      .insert(columns)
      .values({
        board_id: boardDbId,
        name,
        position: positionRecords ? positionRecords.position + 1 : 1,
      })
      .returning();

    const entity = new ColumnEntity({
      id: created.id,
      boardId: created.board_id,
      name: created.name,
      position: created.position,
      createdAt: created.created_at,
      cards: [],
    });

    return entity;
  }

  async existsByNameAndBoardId(
    name: string,
    readableBoardId: string,
  ): Promise<boolean> {
    const boardRecord = await this.db
      .select()
      .from(boards)
      .where(eq(boards.readable_id, readableBoardId))
      .limit(1);

    if (!boardRecord || boardRecord.length === 0) {
      return false;
    }

    const foundId = boardRecord[0].id;

    const [result] = await this.db
      .select({ count: count() })
      .from(columns)
      .where(and(eq(columns.name, name), eq(columns.board_id, foundId)));

    return result.count > 0;
  }

  async delete(columnId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(cards).where(eq(cards.column_id, columnId));
      await tx.delete(columns).where(eq(columns.id, columnId));
    });
  }

  async findAllByBoardId(boardId: string): Promise<ColumnEntity[]> {
    const records = await this.db
      .select({
        column: columns,
        card: cards,
      })
      .from(columns)
      .leftJoin(cards, eq(columns.id, cards.column_id))
      .where(eq(columns.board_id, boardId))
      .orderBy(columns.position, cards.position);

    const columnMap = new Map<string, ColumnEntity>();

    for (const { column: colRecord, card: cardRecord } of records) {
      let columnEntity = columnMap.get(colRecord.id);
      if (!columnEntity) {
        columnEntity = new ColumnEntity({
          id: colRecord.id,
          boardId: colRecord.board_id,
          name: colRecord.name,
          position: colRecord.position,
          createdAt: colRecord.created_at ?? new Date(),
          cards: [],
        });
        columnMap.set(colRecord.id, columnEntity);
      }

      if (cardRecord && cardRecord.id) {
        columnEntity.cards.push(
          new CardEntity({
            id: cardRecord.id,
            columnId: cardRecord.column_id,
            title: cardRecord.title,
            description: cardRecord.description,
            position: cardRecord.position,
            createdAt: cardRecord.created_at ?? new Date(),
            assignedTo: cardRecord.assigned_to ?? null,
            dueDate: cardRecord.due_date ?? null,
            updatedAt: cardRecord.updated_at ?? null,
          }),
        );
      }
    }

    return Array.from(columnMap.values());
  }
  async findReadableTeamIdByColumnId(columnId: string): Promise<string> {
    const record = await this.db
      .select({ teamReadableId: teams.readable_id })
      .from(columns)
      .innerJoin(boards, eq(columns.board_id, boards.id))
      .innerJoin(teams, eq(boards.team_id, teams.id))
      .where(eq(columns.id, columnId))
      .limit(1);

    if (record.length === 0) {
      throw new BadRequestException('Column not found');
    }

    return record[0].teamReadableId;
  }
}
