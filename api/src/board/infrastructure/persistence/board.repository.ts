import { Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
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
  comments,
  teams,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(
    @InjectDb() private readonly db: DB,
    private readonly userRepository: UserRepository,
  ) {}

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

  async createBoard({ userId, teamId, name, description }: CreateBoardCommand) {
    const [team] = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.readable_id, teamId));

    if (!team) {
      throw new Error(`Team not found for readable_id: ${teamId}`);
    }

    const userRole = await this.userRepository.getUserRoleByTeamId(
      team.id,
      userId,
    );

    if (userRole !== 'admin') {
      throw new Error(
        `User does not have permission to create a board in team: ${teamId}`,
      );
    }

    await this.db.transaction(async (tx) => {
      const created = await tx
        .insert(boards)
        .values({
          name,
          description,
          team_id: team.id,
          readable_id: generateReadableId(),
        })
        .returning({ id: boards.id, readableId: boards.readable_id });

      if (!created[0]) {
        throw new Error('Failed to create board');
      }
    });
  }

  async deleteBoardById(readableId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [board] = await tx
        .select({ id: boards.id })
        .from(boards)
        .where(eq(boards.readable_id, readableId));

      if (!board) {
        throw new Error(`Board not found for readable_id: ${readableId}`);
      }

      await tx.delete(comments).where(
        inArray(
          comments.card_id,
          tx
            .select({ id: cards.id })
            .from(cards)
            .where(
              inArray(
                cards.column_id,
                tx
                  .select({ id: columns.id })
                  .from(columns)
                  .where(eq(columns.board_id, board.id)),
              ),
            ),
        ),
      );

      await tx
        .delete(cards)
        .where(
          inArray(
            cards.column_id,
            tx
              .select({ id: columns.id })
              .from(columns)
              .where(eq(columns.board_id, board.id)),
          ),
        );

      await tx.delete(columns).where(eq(columns.board_id, board.id));

      await tx.delete(boards).where(eq(boards.id, board.id));
    });
  }
}
