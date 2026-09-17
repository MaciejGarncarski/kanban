import { ColumnEntity } from '../column.entity.js';

export interface ColumnRepositoryInterface {
  findById(columnId: string): Promise<ColumnEntity | null>;
  createColumn(readableBoardId: string, name: string): Promise<ColumnEntity>;
  checkMaxColumns(readableBoardId: string): Promise<boolean>;
  existsByNameAndBoardId(
    name: string,
    readableBoardId: string,
  ): Promise<boolean>;
  save(column: ColumnEntity): Promise<void>;
  delete(columnId: string): Promise<void>;
  findAllByBoardId(readableBoardId: string): Promise<ColumnEntity[]>;
}
