import { Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { ColumnRepositoryInterface } from 'src/column/domain/ports/column.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { columns } from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class ColumnRepository implements ColumnRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async checkMaxColumns(boardId: string): Promise<boolean> {
    const [columnCount] = await this.db
      .select({ count: count() })
      .from(columns)
      .where(eq(columns.board_id, boardId));

    return columnCount.count >= 6;
  }

  async createColumn(boardId: string, name: string): Promise<ColumnEntity> {
    const [positionRecords] = await this.db
      .select()
      .from(columns)
      .where(eq(columns.board_id, boardId))
      .orderBy(desc(columns.position))
      .limit(1);

    const [created] = await this.db
      .insert(columns)
      .values({
        board_id: boardId,
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
    boardId: string,
  ): Promise<boolean> {
    const [result] = await this.db
      .select({ count: count() })
      .from(columns)
      .where(and(eq(columns.name, name), eq(columns.board_id, boardId)));

    return result.count > 0;
  }
}
