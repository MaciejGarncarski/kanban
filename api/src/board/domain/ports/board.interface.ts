import { BoardAggregate } from 'src/board/domain/board.entity';

export interface BoardRepositoryInterface {
  findByTeamId(teamId: string): Promise<BoardAggregate[]>;
  findById(boardId: string): Promise<BoardAggregate | null>;
  createBoard(board: {
    userId: string;
    name: string;
    description: string;
  }): Promise<void>;
  deleteBoardById(boardId: string): Promise<void>;
}
