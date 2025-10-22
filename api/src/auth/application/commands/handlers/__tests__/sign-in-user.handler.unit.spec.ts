import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { verify } from '@node-rs/argon2';
import { SignInUserHandler } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { InMemoryRefreshTokenRepository } from 'src/auth/infrastructure/persistence/__tests__/mocks/in-memory-refresh-token.repository';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { UserRepositoryInterface } from 'src/user/domain/repository/user.interface';
import { User } from 'src/user/domain/user.entity';
import { InMemoryUserRepository } from 'src/user/infrastructure/persistence/__tests__/mocks/in-memory-user.repository';
import { UserMapper } from 'src/user/infrastructure/persistence/mappers/user.mapper';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

jest.mock('@node-rs/argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
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
          useValue: { sign: jest.fn().mockReturnValue('random-token') },
        },
      ],
    }).compile();

    handler = module.get<SignInUserHandler>(SignInUserHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should return signed in user tokens', async () => {
    (verify as jest.Mock).mockResolvedValue(true);

    const mockData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const newUser = new User({
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
    (verify as jest.Mock).mockResolvedValue(false);

    const mockData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const newUser = new User({
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
