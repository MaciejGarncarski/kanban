import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { UserController } from 'src/user/infrastructure/controllers/user.controller';
import { GetRoleByTeamIdHandler } from 'src/user/application/queries/handlers/get-role-by-team-id.handler';
import { GetAllUsersHandler } from 'src/user/application/queries/handlers/get-all-users.handler';
import { GetUsersByTeamIdHandler } from 'src/user/application/queries/handlers/get-users-by-team-id.handler';

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
