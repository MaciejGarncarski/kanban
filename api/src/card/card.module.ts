import { Module } from '@nestjs/common';
import { CreateCardHandler } from 'src/card/application/commands/handlers/create-card.handler';
import { DeleteCardHandler } from 'src/card/application/commands/handlers/delete-card.handler';
import { UpdateCardHandler } from 'src/card/application/commands/handlers/update-card.handler';
import { CardController } from 'src/card/infrastructure/controllers/card.controller';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

const CommandHandlers = [
  CreateCardHandler,
  DeleteCardHandler,
  UpdateCardHandler,
];
const QueryHandlers = [];
const Repositories = [CardRepository, UserRepository];

@Module({
  controllers: [CardController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...Repositories,
    ProfanityCheckService,
  ],
})
export class CardModule {}
