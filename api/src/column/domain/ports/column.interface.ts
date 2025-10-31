import { ColumnEntity } from 'src/column/domain/column.entity';

export interface ColumnRepositoryInterface {
  findById(columnId: string): Promise<ColumnEntity | null>;
  createColumn(boardId: string, name: string): Promise<ColumnEntity>;
  checkMaxColumns(boardId: string): Promise<boolean>;
  existsByNameAndBoardId(name: string, boardId: string): Promise<boolean>;
  save(column: ColumnEntity): Promise<void>;
  delete(columnId: string): Promise<void>;
  findAllByBoardId(boardId: string): Promise<ColumnEntity[]>;
}
