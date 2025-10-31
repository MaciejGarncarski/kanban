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

    const card = await this.cardRepo.findById(cardId);

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const role = await this.queryBus.execute<GetRoleByColumnIdQuery, TeamRole>(
      new GetRoleByColumnIdQuery(card.columnId, userId),
    );

    if (position !== undefined) {
      if (columnId && columnId === card.columnId) {
        const allCards = await this.cardRepo.findAllByColumnId(columnId);
        const filtered = allCards.filter((c) => c.id !== cardId);
        const insertIndex = position > 0 ? position - 1 : 0;
        filtered.splice(insertIndex, 0, card);

        await Promise.all(
          filtered.map((c, idx) =>
            this.cardRepo.updateCard(
              new CardEntity({ ...c, position: idx + 1 }),
            ),
          ),
        );
        return;
      }

      if (columnId && columnId !== card.columnId) {
        const updatedCard = new CardEntity({
          ...card,
          columnId,
          position,
        });
        await this.cardRepo.updateCard(updatedCard);
        return;
      }
    }

    if (role !== teamRoles.ADMIN) {
      throw new UnauthorizedException(
        'Only admins can update card details other than position.',
      );
    }

    const updatedCard = new CardEntity({
      ...card,
      title: title ?? card.title,
      description: description ?? card.description,
      dueDate: dueDate ?? card.dueDate,
      assignedTo: assignedTo ?? card.assignedTo,
      position: position ?? card.position,
      columnId: columnId ?? card.columnId,
    });

    await this.cardRepo.updateCard(updatedCard);
  }
}
