import { BoardAggregate } from 'src/board/domain/board.entity';
import {
  BoardMapper,
  BoardRecord,
  CardRecord,
  ColumnRecord,
} from 'src/board/infrastructure/persistence/mappers/board.mapper';
import { ColumnEntity } from 'src/column/domain/column.entity';

describe('BoardMapper', () => {
  describe('toDomain', () => {
    it('should map BoardRecord, ColumnRecord[], and CardRecord[] to BoardAggregate', () => {
      const boardDate = new Date('2023-01-01T00:00:00Z');
      const columnDate = new Date('2023-01-01T01:00:00Z');
      const cardDate = new Date('2023-01-01T02:00:00Z');

      // Arrange
      const boardRecord: BoardRecord = {
        id: 'board-1',
        readable_id: 'readable-board-1',
        name: 'Project Board',
        description: 'Board for project tasks',
        team_id: 'team-1',
        created_at: boardDate,
      };

      const columnRecords: ColumnRecord[] = [
        {
          id: 'column-1',
          board_id: 'board-1',
          name: 'To Do',
          position: 1,
          created_at: columnDate,
        },
      ];

      const cardRecords: CardRecord[] = [
        {
          id: 'card-1',
          column_id: 'column-1',
          title: 'Task 1',
          assigned_to: 'user-1',
          description: 'First task description',
          position: 1,
          created_at: cardDate,
          updated_at: null,
          due_date: null,
        },
      ];

      const boardReadableTeamId = 'readable-team-1';

      // Act
      const boardAggregate = BoardMapper.toDomain(
        boardRecord,
        boardReadableTeamId,
        columnRecords,
        cardRecords,
      );

      // Assert
      expect(boardAggregate).toBeInstanceOf(BoardAggregate);
      expect(boardAggregate.id).toBe('board-1');
      expect(boardAggregate.readableId).toBe('readable-board-1');
      expect(boardAggregate.name).toBe('Project Board');
      expect(boardAggregate.description).toBe('Board for project tasks');
      expect(boardAggregate.teamId).toBe('team-1');
      expect(boardAggregate.readableTeamId).toBe('readable-team-1');
      expect(boardAggregate.createdAt).toEqual(
        new Date('2023-01-01T00:00:00Z'),
      );
      expect(boardAggregate.columns).toHaveLength(1);

      const column = boardAggregate.columns ? boardAggregate.columns[0] : null;
      expect(column).toBeInstanceOf(ColumnEntity);
      expect(column?.id).toBe('column-1');
      expect(column?.boardId).toBe('board-1');
      expect(column?.name).toBe('To Do');
      expect(column?.position).toBe(1);
      expect(column?.createdAt).toEqual(new Date('2023-01-01T01:00:00Z'));
      expect(column?.cards).toHaveLength(1);
    });
  });
});
