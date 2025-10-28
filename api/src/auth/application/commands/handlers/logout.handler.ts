import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from 'src/auth/application/commands/logout.command';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';

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
