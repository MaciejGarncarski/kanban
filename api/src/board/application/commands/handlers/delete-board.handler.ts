import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBoardCommand } from '../delete-board.command.js';
import { BoardRepository } from '../../../infrastructure/persistence/board.repository.js';
import { teamRoles } from '../../../../team/domain/types/team.types.js';
import { UserRepository } from '../../../../user/infrastructure/persistence/user.repository.js';

@CommandHandler(DeleteBoardCommand)
export class DeleteBoardHandler implements ICommandHandler<DeleteBoardCommand> {
  constructor(
    private readonly boardRepository: BoardRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: DeleteBoardCommand): Promise<void> {
    const { readableBoardId } = command;

    const role = await this.userRepository.getUserRoleByBoardId(
      readableBoardId,
      command.userId,
    );

    if (role !== teamRoles.ADMIN) {
      throw new Error('Only admins can delete the board');
    }

    await this.boardRepository.deleteBoardById(readableBoardId);
  }
}
