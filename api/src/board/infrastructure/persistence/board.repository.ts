import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';
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
  team_members,
  teams,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async updateBoard(boardData: {
    readableBoardId: string;
    name: string;
    description?: string;
  }): Promise<BoardAggregate> {
    const [prevData] = await this.db
      .select()
      .from(boards)
      .where(eq(boards.readable_id, boardData.readableBoardId))
      .limit(1);

    if (!prevData) {
      throw new BadRequestException('Board not found');
    }

    const [teamData] = await this.db
      .select({ readableId: teams.readable_id })
      .from(teams)
      .where(eq(teams.id, prevData.team_id));

    const [updated] = await this.db
      .update(boards)
      .set({
        name: boardData.name,
        description: boardData.description
          ? boardData.description
          : prevData.description,
      })
      .where(eq(boards.readable_id, boardData.readableBoardId))
      .returning();

    return new BoardAggregate({
      createdAt: updated.created_at,
      description: updated.description,
      id: updated.id,
      name: updated.name,
      readableId: updated.readable_id,
      readableTeamId: teamData.readableId,
      teamId: updated.team_id,
      columns: [],
    });
  }

  async findByTeamId(
    userId: string,
    readableTeamId: string,
  ): Promise<BoardAggregate[]> {
    const boardRecords = await this.db
      .select({
        board: boards,
        teams: teams,
      })
      .from(boards)
      .innerJoin(team_members, eq(team_members.team_id, boards.team_id))
      .innerJoin(teams, eq(boards.team_id, teams.id))
      .where(
        and(
          eq(team_members.user_id, userId),
          eq(teams.readable_id, readableTeamId),
        ),
      );

    return boardRecords.map((record) =>
      BoardMapper.toDomain(record.board, record.teams.readable_id),
    );
  }

  async findById(
    userId: string,
    readableBoardId: string,
  ): Promise<BoardAggregate | null> {
    const rows = await this.db
      .select({
        board: boards,
        column: columns,
        card: cards,
        teams: teams,
      })
      .from(boards)
      .innerJoin(team_members, eq(team_members.team_id, boards.team_id))
      .innerJoin(teams, eq(boards.team_id, teams.id))
      .leftJoin(columns, eq(columns.board_id, boards.id))
      .leftJoin(cards, eq(cards.column_id, columns.id))
      .where(
        and(
          eq(team_members.user_id, userId),
          eq(boards.readable_id, readableBoardId),
        ),
      );

    if (rows.length === 0) return null;

    const boardRecord = rows[0].board;
    const boardAggregate = BoardMapper.toDomain(
      boardRecord,
      rows[0].teams.readable_id,
      [],
      [],
    );

    const columnMap = new Map<string, ColumnEntity>();

    // Build columns and cards from the rows
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

  async createBoard({
    userId,
    readableTeamId,
    name,
    description,
  }: CreateBoardCommand) {
    const [team] = await this.db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.readable_id, readableTeamId));

    if (!team) {
      throw new BadRequestException(
        `Team not found for readable_id: ${readableTeamId}`,
      );
    }

    const boardNameExists = await this.db
      .select()
      .from(boards)
      .where(and(eq(boards.team_id, team.id), eq(boards.name, name)))
      .limit(1);

    if (boardNameExists.length > 0) {
      throw new BadRequestException(
        `Board with name "${name}" already exists in team: ${readableTeamId}`,
      );
    }

    const [teamMember] = await this.db
      .select()
      .from(team_members)
      .innerJoin(teams, eq(team_members.team_id, teams.id))
      .where(
        and(
          eq(teams.readable_id, readableTeamId),
          eq(team_members.user_id, userId),
        ),
      );

    if (!teamMember) {
      throw new BadRequestException(
        'User is not authorized to access this team',
      );
    }

    if (teamMember.team_members.role !== teamRoles.ADMIN) {
      throw new ForbiddenException(
        `User does not have permission to create a board in team: ${readableTeamId}`,
      );
    }

    const board = await this.db.transaction(async (tx) => {
      const created = await tx
        .insert(boards)
        .values({
          name,
          description,
          team_id: team.id,
          readable_id: generateReadableId(),
        })
        .returning();

      return created[0];
    });

    return new BoardAggregate({
      id: board.id,
      name,
      description,
      teamId: team.id,
      readableId: board.readable_id,
      columns: [],
      readableTeamId: readableTeamId,
      createdAt: board.created_at,
    });
  }

  async deleteBoardById(readableId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      const [board] = await tx
        .select({ id: boards.id })
        .from(boards)
        .where(eq(boards.readable_id, readableId));

      if (!board) {
        throw new BadRequestException(
          `Board not found for readable_id: ${readableId}`,
        );
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
