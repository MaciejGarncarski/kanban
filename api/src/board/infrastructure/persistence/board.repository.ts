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
  teams,
} from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async findByTeamId(teamId: string): Promise<BoardAggregate[]> {
    const boardRecords = await this.db
      .select({
        board: boards,
        teams: teams,
      })
      .from(boards)
      .innerJoin(teams, eq(boards.team_id, teams.id))
      .where(eq(teams.readable_id, teamId));

    return boardRecords.map((record) =>
      BoardMapper.toDomain(record.board, record.teams.readable_id),
    );
  }

  async findById(boardId: string): Promise<BoardAggregate | null> {
    const rows = await this.db
      .select({
        board: boards,
        column: columns,
        card: cards,
        teams: teams,
      })
      .from(boards)
      .where(eq(boards.readable_id, boardId))
      .innerJoin(teams, eq(boards.team_id, teams.id))
      .leftJoin(columns, eq(columns.board_id, boards.id))
      .leftJoin(cards, eq(cards.column_id, columns.id));

    if (rows.length === 0) return null;

    const boardRecord = rows[0].board;
    const boardAggregate = BoardMapper.toDomain(
      boardRecord,
      rows[0].teams.readable_id,
      [],
      [],
    );

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
          updatedAt: row.card.updated_at ? new Date(row.card.updated_at) : null,
        });
        columnEntity.addCard(card);
      }
    }

    boardAggregate.sortColumns();

    return boardAggregate;
  }

  async createBoard(board: BoardAggregate): Promise<BoardAggregate> {
    const boardRecord = BoardMapper.toPersistence(board);
    const columnRecords = BoardMapper.toPersistenceColumns(board);
    const cardRecords = BoardMapper.toPersistenceCards(board);

    const result = await this.db.transaction(async (tx) => {
      const boardRow = await tx.insert(boards).values(boardRecord).returning();
      let columnRows: {
        name: string;
        id: string;
        created_at: Date | null;
        board_id: string;
        position: number;
      }[] = [];

      let cardRows: {
        id: string;
        column_id: string;
        title: string;
        description: string | null;
        assigned_to: string | null;
        position: number;
        created_at: Date | null;
        updated_at: Date | null;
        due_date: Date | null;
      }[] = [];

      if (columnRecords.length > 0) {
        columnRows = await tx.insert(columns).values(columnRecords).returning();
      }

      if (cardRecords.length > 0) {
        cardRows = await tx.insert(cards).values(cardRecords).returning();
      }

      return {
        board: boardRow[0],
        columns: columnRows,
        cards: cardRows,
      };
    });

    return BoardMapper.toDomain(
      {
        created_at: result.board.created_at,
        description: result.board.description,
        name: result.board.name,
        team_id: result.board.team_id,
        readable_id: result.board.readable_id,
        id: result.board.id,
      },
      board.readableTeamId,
      result.columns,
      result.cards,
    );
  }
}
