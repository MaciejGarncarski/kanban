import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BoardAggregate } from 'src/board/domain/board.entity';
import { BoardRepositoryInterface } from 'src/board/domain/ports/board.interface';
import { BoardMapper } from 'src/board/infrastructure/persistence/mappers/board.mapper';
import { CardEntity } from 'src/card/domain/card.entity';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
} from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async findByTeamId(teamId: string): Promise<BoardAggregate[]> {
    const boardRecords = await this.db
      .select()
      .from(boards)
      .where(eq(boards.team_id, teamId));

    return boardRecords.map((record) => BoardMapper.toDomain(record));
  }

  async findById(boardId: string): Promise<BoardAggregate | null> {
    const rows = await this.db
      .select({
        board: boards,
        column: columns,
        card: cards,
      })
      .from(boards)
      .where(eq(boards.id, boardId))
      .leftJoin(columns, eq(columns.board_id, boards.id))
      .leftJoin(cards, eq(cards.column_id, columns.id));

    if (rows.length === 0) return null;

    const boardRecord = rows[0].board;
    const boardAggregate = BoardMapper.toDomain(boardRecord, [], []);

    const columnMap = new Map<string, ColumnEntity>();

    for (const row of rows) {
      if (!row.column || !row.column.id) continue;

      let columnEntity = columnMap.get(row.column.id);
      if (!columnEntity) {
        columnEntity = new ColumnEntity({
          id: row.column.id,
          boardId: row.column.board_id,
          name: row.column.name,
          position: row.column.position,
          createdAt: row.column.created_at ?? new Date(),
          cards: [],
        });
        columnMap.set(row.column.id, columnEntity);
        boardAggregate.addColumn(columnEntity);
      }

      if (row.card && row.card.id) {
        const card = new CardEntity({
          id: row.card.id,
          columnId: row.card.column_id,
          title: row.card.title,
          description: row.card.description,
          assignedTo: row.card.assigned_to,
          position: row.card.position,
          createdAt: row.card.created_at ? new Date(row.card.created_at) : null,
          dueDate: row.card.due_date ? new Date(row.card.due_date) : null,
        });
        columnEntity.addCard(card);
      }
    }

    boardAggregate.sortColumns();

    return boardAggregate;
  }

  // async createBoard(board: BoardAggregate): Promise<BoardAggregate> {
  //   const boardRecord = BoardMapper.toPersistence(board);
  //   const columnRecords = BoardMapper.toPersistenceColumns(board);
  //   const cardRecords = BoardMapper.toPersistenceCards(board);

  //   const result = await this.db.transaction(async (tx) => {
  //     const boardRow = await tx.insert(boards).values(boardRecord).returning();
  //     let columnRows = [];
  //     if (columnRecords.length > 0) {
  //       columnRows = await tx.insert(columns).values(columnRecords).returning();
  //     }
  //     if (cardRecords.length > 0) {
  //       await tx.insert(cards).values(cardRecords);
  //     }
  //   });

  //   return BoardMapper.toDomain(result);
  // }
}
