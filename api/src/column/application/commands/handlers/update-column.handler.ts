import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateColumnCommand } from 'src/column/application/commands/update-column.command';
import { ColumnEntity } from 'src/column/domain/column.entity';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';

@CommandHandler(UpdateColumnCommand)
export class UpdateColumnHandler
  implements ICommandHandler<UpdateColumnCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly columnRepository: ColumnRepository,
    private readonly profanityCheckService: ProfanityCheckService,
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

    if (name) {
      const isTitleProfane = await this.profanityCheckService.isProfane(name);

      if (isTitleProfane) {
        throw new BadRequestException(
          'Column name contains inappropriate language.',
        );
      }
    }

    const currentColumn = await this.columnRepository.findById(columnId);

    if (!currentColumn) {
      throw new BadRequestException('Column not found');
    }

    if (position) {
      const allColumns = await this.columnRepository.findAllByBoardId(
        column.boardId,
      );
      const currentColumn = allColumns.find((c) => c.id === columnId);

      if (!currentColumn) {
        throw new Error('Column not found');
      }

      const filtered = allColumns.filter((c) => c.id !== columnId);

      let insertIndex = position - 1;

      if (currentColumn.position < position) {
        insertIndex -= 1;
      }

      if (insertIndex < 0) insertIndex = 0;
      if (insertIndex > filtered.length) insertIndex = filtered.length;

      filtered.splice(insertIndex, 0, currentColumn);

      const newPositions = filtered.map((c, idx) => ({
        ...c,
        position: idx + 1,
      }));

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
