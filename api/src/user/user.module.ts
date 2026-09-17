import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/persistence/user.repository.js';
import { UserController } from './infrastructure/controllers/user.controller.js';
import { GetRoleByTeamIdHandler } from './application/queries/handlers/get-role-by-team-id.handler.js';
import { GetAllUsersHandler } from './application/queries/handlers/get-all-users.handler.js';
import { GetUsersByTeamIdHandler } from './application/queries/handlers/get-users-by-team-id.handler.js';

const QueryHandlers = [
  GetUsersByTeamIdHandler,
  GetRoleByTeamIdHandler,
  GetAllUsersHandler,
];

@Module({
  controllers: [UserController],
  providers: [UserRepository, ...QueryHandlers],
})
export class UserModule {}
