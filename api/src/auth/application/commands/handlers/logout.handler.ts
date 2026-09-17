import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../logout.command.js';
import { RefreshTokenRepository } from '../../../infrastructure/persistence/refresh-token.repository.js';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

  async execute(command: LogoutCommand) {
    const tokenRecord = await this.refreshTokenRepo.findActiveByToken(
      command.refreshToken,
    );

    if (!tokenRecord) {
      return;
    }

    await this.refreshTokenRepo.revoke(tokenRecord.id);
    return true;
  }
}
