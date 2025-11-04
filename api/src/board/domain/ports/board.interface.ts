import { BoardAggregate } from 'src/board/domain/board.entity';

export interface BoardRepositoryInterface {
  findByTeamId(teamId: string): Promise<BoardAggregate[]>;
  findById(boardId: string): Promise<BoardAggregate | null>;
  createBoard(board: {
    userId: string;
    name: string;
    description?: string;
  }): Promise<BoardAggregate>;
  deleteBoardById(boardId: string): Promise<void>;
  updateBoard(boardData: {
    boardId: string;
    name: string;
    description: string;
  }): Promise<BoardAggregate>;
}
