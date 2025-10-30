import { Module } from '@nestjs/common';
import { CreateCardHandler } from 'src/card/application/commands/handlers/create-card.handler';
import { CardController } from 'src/card/infrastructure/controllers/card.controller';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

const CommandHandlers = [CreateCardHandler];
const QueryHandlers = [];
const Repositories = [CardRepository, UserRepository];

@Module({
  controllers: [CardController],
  providers: [...QueryHandlers, ...CommandHandlers, ...Repositories],
})
export class CardModule {}
