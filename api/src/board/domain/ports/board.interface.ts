import { BoardEntity } from 'src/board/domain/board.entity';

export interface BoardRepositoryInterface {
  findByTeamId(teamId: string): Promise<BoardEntity[]>;
  createBoard(board: BoardEntity): Promise<void>;
}
