import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { DeleteCardCommand } from 'src/card/application/commands/delete-card.command';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { TeamRole, teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByTeamIdQuery } from 'src/user/application/queries/get-role-by-team-id.query';

@CommandHandler(DeleteCardCommand)
export class DeleteCardHandler implements ICommandHandler<DeleteCardCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(command: DeleteCardCommand): Promise<boolean> {
    const { cardId, userId } = command;

    const teamId = await this.cardRepository.getTeamIdByCardId(cardId);

    const userRole = await this.queryBus.execute<
      GetRoleByTeamIdQuery,
      TeamRole
    >(new GetRoleByTeamIdQuery(teamId, userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new UnauthorizedException('Unauthorized to delete card');
    }

    await this.cardRepository.deleteCard(cardId);

    return true;
  }
}
