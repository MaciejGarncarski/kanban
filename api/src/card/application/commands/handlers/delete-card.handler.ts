import { UnauthorizedException } from '@nestjs/common';
import {
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { DeleteCardCommand } from '../delete-card.command.js';
import { CardRepository } from '../../../infrastructure/persistence/card.repository.js';
import { SendToTeamMembersEvent } from '../../../../notifications/application/events/send-to-team-members.event.js';
import {
  TeamRole,
  teamRoles,
} from '../../../../team/domain/types/team.types.js';
import { GetRoleByTeamIdQuery } from '../../../../user/application/queries/get-role-by-team-id.query.js';

@CommandHandler(DeleteCardCommand)
export class DeleteCardHandler implements ICommandHandler<DeleteCardCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(command: DeleteCardCommand): Promise<boolean> {
    const { cardId, userId } = command;
    const teamId = await this.cardRepository.getTeamIdByCardId(cardId);

    const readableTeamId =
      await this.cardRepository.getReadableTeamIdByCardId(cardId);

    const userRole = await this.queryBus.execute<
      GetRoleByTeamIdQuery,
      TeamRole
    >(new GetRoleByTeamIdQuery(teamId, userId));

    if (userRole !== teamRoles.ADMIN) {
      throw new UnauthorizedException('Unauthorized to delete card');
    }

    await this.cardRepository.deleteCard(cardId);
    this.eventBus.publish(new SendToTeamMembersEvent(readableTeamId));

    return true;
  }
}
