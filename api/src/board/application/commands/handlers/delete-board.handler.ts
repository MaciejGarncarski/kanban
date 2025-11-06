import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteBoardCommand } from 'src/board/application/commands/delete-board.command';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { teamRoles } from 'src/team/domain/types/team.types';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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
