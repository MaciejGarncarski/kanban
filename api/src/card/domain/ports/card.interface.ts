export interface CardRepositoryInterface {
  getCardsByBoardId(boardId: string): Promise<void>;
}
