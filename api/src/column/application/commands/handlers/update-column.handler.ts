import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateColumnCommand } from 'src/column/application/commands/update-column.command';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';

@CommandHandler(UpdateColumnCommand)
export class UpdateColumnHandler
  implements ICommandHandler<UpdateColumnCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly columnRepository: ColumnRepository,
  ) {}

  async execute(command: UpdateColumnCommand): Promise<ColumnEntity> {
    const { userId, columnId, name, position } = command;
    const column = await this.columnRepository.findById(columnId);

    if (!column) {
      throw new BadRequestException('Column not found');
    }

    const userRole = await this.queryBus.execute<
      GetRoleByColumnIdQuery,
      TeamRole
    >(new GetRoleByColumnIdQuery(columnId, userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new UnauthorizedException(
        'User is not authorized to update this team',
      );
    }

    if (position) {
      const allColumns = await this.columnRepository.findAllByBoardId(
        column.boardId,
      );
      const filtered = allColumns
        .filter((c) => c.id !== columnId)
        .filter(Boolean);
      const insertIndex = position > 0 ? position - 1 : 0;
      filtered.splice(insertIndex, 0, column);

      const newPositions = filtered.map((c, idx) => {
        return { ...c, position: idx + 1 };
      });

      for (const col of newPositions) {
        await this.columnRepository.save(new ColumnEntity({ ...col }));
      }

      return filtered[insertIndex];
    }

    const updatedData = new ColumnEntity({
      name: name ?? column.name,
      position: position ?? column.position,
      boardId: column.boardId,
      id: column.id,
      createdAt: column.createdAt,
      cards: column.cards,
    });

    await this.columnRepository.save(updatedData);

    return updatedData;
  }
}
