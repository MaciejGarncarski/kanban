import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { BoardEntity } from 'src/board/domain/board.entity';
import { boards } from 'src/infrastructure/persistence/db/schema';

export type BoardRecord = InferSelectModel<typeof boards>;
export type NewBoardRecord = InferInsertModel<typeof boards>;

export class BoardMapper {
  static toDomain(board: BoardRecord): BoardEntity {
    return new BoardEntity({
      createdAt: board.created_at ? new Date(board.created_at) : null,
      id: board.id,
      teamId: board.team_id,
      description: board.description || '',
      name: board.name,
    });
  }

  static toPersistence(board: BoardEntity): NewBoardRecord {
    return {
      id: board.id,
      team_id: board.teamId,
      name: board.name,
      description: board.description,
      created_at: board.createdAt ? board.createdAt : new Date(),
    };
  }
}
