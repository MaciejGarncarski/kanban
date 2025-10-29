import { Module } from '@nestjs/common';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { UserController } from 'src/user/infrastructure/controllers/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserRepository],
})
export class UserModule {}
