import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';

@CommandHandler(CreateBoardCommand)
export class CreateBoardHandler implements ICommandHandler<CreateBoardCommand> {
  constructor(private readonly boardRepository: BoardRepository) {}

  async execute(command: CreateBoardCommand): Promise<void> {
    const { userId, description, name, teamId } = command;

    await this.boardRepository.createBoard({
      description,
      name,
      teamId,
      userId,
    });
  }
}
