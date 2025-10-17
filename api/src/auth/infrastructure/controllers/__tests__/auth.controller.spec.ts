import { Test, TestingModule } from '@nestjs/testing';
import { dbProvider } from 'src/db/db.provider';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthController } from 'src/auth/infrastructure/controllers.ts/auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [dbProvider, CommandBus, QueryBus],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
