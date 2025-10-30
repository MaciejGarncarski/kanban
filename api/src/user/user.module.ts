import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { UserController } from 'src/user/infrastructure/controllers/user.controller';
import { GetUsersByBoardHandler } from 'src/user/application/queries/handlers/get-users-by-board.handler';
import { GetRoleByTeamIdHandler } from 'src/user/application/queries/handlers/get-role-by-team-id.handler';

const QueryHandlers = [GetUsersByBoardHandler, GetRoleByTeamIdHandler];

@Module({
  controllers: [UserController],
  providers: [UserRepository, ...QueryHandlers],
})
export class UserModule {}
