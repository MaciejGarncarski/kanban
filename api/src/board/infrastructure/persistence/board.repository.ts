import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { BoardEntity } from 'src/board/domain/board.entity';
import { BoardRepositoryInterface } from 'src/board/domain/ports/board.interface';
import { BoardMapper } from 'src/board/infrastructure/persistence/mappers/board.mapper';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { InjectDb } from 'src/infrastructure/persistence/db/db.provider';
import { boards } from 'src/infrastructure/persistence/db/schema';

@Injectable()
export class BoardRepository implements BoardRepositoryInterface {
  constructor(@InjectDb() private readonly db: DB) {}

  async findByTeamId(teamId: string): Promise<BoardEntity[]> {
    const records = await this.db
      .select()
      .from(boards)
      .where(eq(boards.team_id, teamId));

    return records.map((record) => {
      return BoardMapper.toDomain(record);
    });
  }

  async findById(boardId: string): Promise<BoardEntity | null> {
    const [record] = await this.db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1);

    if (!record) {
      return null;
    }

    return BoardMapper.toDomain(record);
  }

  createBoard(board: BoardEntity): Promise<void> {
    return Promise.resolve();
    // Implementation goes here
  }
}
