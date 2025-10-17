import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { dbProvider } from 'src/db/db.provider';
import { UserController } from 'src/user/infrastructure/controllers/user.controller';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

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
