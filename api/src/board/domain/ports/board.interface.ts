import { BoardAggregate } from 'src/board/domain/board.entity';

export interface BoardRepositoryInterface {
  findByTeamId(teamId: string): Promise<BoardAggregate[]>;
  findById(boardId: string): Promise<BoardAggregate | null>;
  createBoard(board: BoardAggregate): Promise<BoardAggregate>;
}
