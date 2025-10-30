import { Injectable } from '@nestjs/common';
import { count, desc, eq } from 'drizzle-orm';
import { ColumnRepositoryInterface } from 'src/column/domain/ports/column.interface';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { columns } from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class ColumnRepository implements ColumnRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}
  async createColumn(
    boardId: string,
    name: string,
  ): Promise<{
    name: string;
    id: string;
    board_id: string;
    created_at: Date | null;
    position: number;
  }> {
    const [columnCount] = await this.db
      .select({ count: count() })
      .from(columns)
      .where(eq(columns.board_id, boardId));

    if (columnCount.count >= 6) {
      throw new Error('Maximum number of columns reached for this board.');
    }

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
        position: positionRecords ? positionRecords.position + 1 : 0,
      })
      .returning();

    return created;
  }
}
