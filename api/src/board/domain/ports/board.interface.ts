import { BoardAggregate } from 'src/board/domain/board.entity';

export interface BoardRepositoryInterface {
  findByTeamId(
    userId: string,
    readableTeamId: string,
  ): Promise<BoardAggregate[]>;
  findById(
    userId: string,
    readableBoardId: string,
  ): Promise<BoardAggregate | null>;
  createBoard(board: {
    userId: string;
    name: string;
    description?: string;
  }): Promise<BoardAggregate>;
  deleteBoardById(readableBoardId: string): Promise<void>;
  updateBoard(boardData: {
    readableBoardId: string;
    name: string;
    description: string;
  }): Promise<BoardAggregate>;
}
