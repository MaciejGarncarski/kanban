export interface ColumnRepositoryInterface {
  createColumn(
    boardId: string,
    name: string,
    position: number,
  ): Promise<{
    name: string;
    id: string;
    board_id: string;
    created_at: Date | null;
    position: number;
  }>;
}
