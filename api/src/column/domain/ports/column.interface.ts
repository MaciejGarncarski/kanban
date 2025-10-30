import { ColumnEntity } from 'src/column/domain/column.entity';

export interface ColumnRepositoryInterface {
  createColumn(boardId: string, name: string): Promise<ColumnEntity>;
  checkMaxColumns(boardId: string): Promise<boolean>;
  existsByNameAndBoardId(name: string, boardId: string): Promise<boolean>;
}
