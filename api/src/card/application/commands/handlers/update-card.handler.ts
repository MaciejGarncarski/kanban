import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, QueryBus } from '@nestjs/cqrs';
import { UpdateCardCommand } from 'src/card/application/commands/update-card.command';
import { CardEntity } from 'src/card/domain/card.entity';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdQuery } from 'src/user/application/queries/get-role-by-column-id.query';

@CommandHandler(UpdateCardCommand)
export class UpdateCardHandler {
  constructor(
    private readonly cardRepo: CardRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: UpdateCardCommand) {
    const {
      title,
      description,
      dueDate,
      assignedTo,
      position,
      columnId,
      cardId,
      userId,
    } = command;

    const cardToMove = await this.cardRepo.findById(cardId);

    if (!cardToMove) {
      throw new NotFoundException('Card not found');
    }

    const role = await this.queryBus.execute<GetRoleByColumnIdQuery, TeamRole>(
      new GetRoleByColumnIdQuery(cardToMove.columnId, userId),
    );

    if (position !== undefined) {
      if (columnId && columnId === cardToMove.columnId) {
        const allCards = await this.cardRepo.findAllByColumnId(columnId);
        const filtered = allCards.filter((c) => c.id !== cardId);
        const insertIndex = position > 0 ? position - 1 : 0;
        console.log({ insertIndex });

        filtered.splice(insertIndex, 0, cardToMove);

        await Promise.all(
          filtered.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );
        return;
      }

      if (columnId && columnId !== cardToMove.columnId) {
        const sourceCards = await this.cardRepo.findAllByColumnId(
          cardToMove.columnId,
        );
        const sourceFiltered = sourceCards.filter((c) => c.id !== cardId);

        await Promise.all(
          sourceFiltered.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );

        const targetCards = await this.cardRepo.findAllByColumnId(columnId);
        const insertIndex = Math.max(
          0,
          Math.min(position - 1, targetCards.length),
        );
        targetCards.splice(
          insertIndex,
          0,
          new CardEntity({ ...cardToMove, columnId }),
        );

        await Promise.all(
          targetCards.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );

        return;
      }
    }

    if (role !== teamRoles.ADMIN) {
      throw new UnauthorizedException(
        'Only admins can update card details other than position.',
      );
    }

    const updatedCard = new CardEntity({
      ...cardToMove,
      title: title ?? cardToMove.title,
      description: description ?? cardToMove.description,
      dueDate: dueDate ?? cardToMove.dueDate,
      assignedTo: assignedTo ?? cardToMove.assignedTo,
      position: position ?? cardToMove.position,
      columnId: columnId ?? cardToMove.columnId,
    });

    await this.cardRepo.updateCard(updatedCard);
  }
}
