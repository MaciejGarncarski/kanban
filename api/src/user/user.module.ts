import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { UserController } from 'src/user/infrastructure/controllers/user.controller';

@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
