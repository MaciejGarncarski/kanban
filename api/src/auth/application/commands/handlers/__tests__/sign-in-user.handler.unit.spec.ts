import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { verify } from '@node-rs/argon2';
import { SignInUserHandler } from '../sign-in-user.handler.js';
import { SignInUserCommand } from '../../sign-in-user.command.js';
import { InMemoryRefreshTokenRepository } from '../../../../infrastructure/persistence/__tests__/mocks/in-memory-refresh-token.repository.js';
import { RefreshTokenRepository } from '../../../../infrastructure/persistence/refresh-token.repository.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserEntity } from '../../../../../user/domain/user.entity.js';
import { InMemoryUserRepository } from '../../../../../user/infrastructure/persistence/__tests__/mocks/in-memory-user.repository.js';
import { UserMapper } from '../../../../../user/infrastructure/persistence/mappers/user.mapper.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { type Mock, vi } from 'vitest';

vi.mock('@node-rs/argon2', () => ({
  hash: vi.fn(),
  verify: vi.fn(),
}));

describe('sign-in-user-handler unit', () => {
  let handler: SignInUserHandler;
  let userRepo: UserRepositoryInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUserHandler,
        {
          provide: RefreshTokenRepository,
          useClass: InMemoryRefreshTokenRepository,
        },
        { provide: UserRepository, useClass: InMemoryUserRepository },
        {
          provide: JwtService,
          useValue: { sign: vi.fn().mockReturnValue('random-token') },
        },
      ],
    }).compile();

    handler = module.get<SignInUserHandler>(SignInUserHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should return signed in user tokens', async () => {
    (verify as Mock).mockResolvedValue(true);

    const mockData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const newUser = new UserEntity({
      name: 'Test User',
      email: mockData.email,
      passwordHash: mockData.password,
    });

    const persistentUser = UserMapper.toPersistence(newUser);
    await userRepo.create(persistentUser);

    const result = await handler.execute(
      new SignInUserCommand(mockData.email, mockData.password),
    );

    expect(result).toHaveProperty('accessToken', 'random-token');
    expect(result).toHaveProperty('refreshToken');
  });

  it('should throw error for invalid credentials', async () => {
    (verify as Mock).mockResolvedValue(false);

    const mockData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const newUser = new UserEntity({
      name: 'Test User',
      email: mockData.email,
      passwordHash: 'correctpasswordhash',
    });

    const persistentUser = UserMapper.toPersistence(newUser);
    await userRepo.create(persistentUser);

    await expect(
      handler.execute(new SignInUserCommand(mockData.email, mockData.password)),
    ).rejects.toThrow('Invalid credentials');
  });
});
