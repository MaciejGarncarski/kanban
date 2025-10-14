import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserRepository } from 'src/user/user.repository';
import { UserService } from 'src/user/user.service';
import { dbProvider } from 'src/db/db.provider';

describe('UserController', () => {
  let controller: UserController;

  // beforeAll(async () => {
  //   await resetDb();
  // });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService, UserRepository, dbProvider],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getUsers()', () => {
    it('should return single user data', async () => {
      const lastUsers = await controller.getUsers();

      expect(lastUsers).toBeDefined();
    });
  });
});
