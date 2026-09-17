import { Module } from '@nestjs/common';
import { CreateCardHandler } from './application/commands/handlers/create-card.handler.js';
import { DeleteCardHandler } from './application/commands/handlers/delete-card.handler.js';
import { UpdateCardHandler } from './application/commands/handlers/update-card.handler.js';
import { CardController } from './infrastructure/controllers/card.controller.js';
import { CardRepository } from './infrastructure/persistence/card.repository.js';
import { ProfanityCheckService } from '../infrastructure/services/profanity-check.service.js';
import { UserRepository } from '../user/infrastructure/persistence/user.repository.js';

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
