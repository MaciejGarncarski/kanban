import { Module } from '@nestjs/common';
import { CardController } from 'src/card/infrastructure/controllers/card.controller';

const CommandHandlers = [];
const QueryHandlers = [];

@Module({
  controllers: [CardController],
  providers: [...QueryHandlers, ...CommandHandlers],
})
export class CardModule {}
