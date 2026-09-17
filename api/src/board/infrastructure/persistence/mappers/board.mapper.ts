import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { BoardAggregate } from '../../../domain/board.entity.js';
import { ColumnEntity } from '../../../../column/domain/column.entity.js';
import { CardEntity } from '../../../../card/domain/card.entity.js';
import {
  boards,
  columns,
  cards,
} from '../../../../infrastructure/persistence/db/schema.js';

export type BoardRecord = InferSelectModel<typeof boards>;
export type NewBoardRecord = InferInsertModel<typeof boards>;

export type ColumnRecord = InferSelectModel<typeof columns>;
export type NewColumnRecord = InferInsertModel<typeof columns>;

export type CardRecord = InferSelectModel<typeof cards>;
export type NewCardRecord = InferInsertModel<typeof cards>;
export class BoardMapper {
  static toDomain(
    board: BoardRecord,
    boardReadableTeamId: string,
    boardColumns: ColumnRecord[] = [],
    boardCards: CardRecord[] = [],
  ): BoardAggregate {
    const columnsWithCards = boardColumns.map((col) => {
      const colCards = boardCards
        .filter((c) => c.column_id === col.id)
        .map(
          (card) =>
            new CardEntity({
              id: card.id,
              columnId: card.column_id,
              title: card.title,
              assignedTo: card.assigned_to,
              description: card.description ?? null,
              position: card.position,
              createdAt: card.created_at ? new Date(card.created_at) : null,
              updatedAt: card.updated_at ? new Date(card.updated_at) : null,
              dueDate: card.due_date ? new Date(card.due_date) : null,
            }),
        );

      return new ColumnEntity({
        id: col.id,
        boardId: col.board_id,
        name: col.name,
        position: col.position,
        createdAt: col.created_at ? new Date(col.created_at) : null,
        cards: colCards,
      });
    });

    return new BoardAggregate({
      readableId: board.readable_id,
      name: board.name,
      description: board.description ?? null,
      teamId: board.team_id,
      createdAt: board.created_at ? new Date(board.created_at) : null,
      columns: columnsWithCards,
      id: board.id,
      readableTeamId: boardReadableTeamId,
    });
  }
}
