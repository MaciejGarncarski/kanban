import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { SignInUserHandler } from 'src/auth/application/commands/handlers/sign-in-user.handler';
import { SignInUserCommand } from 'src/auth/application/commands/sign-in-user.command';
import { JWTPayload } from 'src/auth/domain/token.types';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserEntity } from 'src/user/domain/user.entity';
import { UserMapper } from 'src/user/infrastructure/persistence/mappers/user.mapper';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('sign-in-user-handler integration', () => {
  let handler: SignInUserHandler;
  let userRepo: UserRepositoryInterface;
  let refreshTokenRepo: RefreshTokenRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;
  let jwtService: JwtService;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    refreshTokenRepo = new RefreshTokenRepository(db);
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        SignInUserHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<SignInUserHandler>(SignInUserHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return signed in user tokens', async () => {
    const mockData = {
      email: faker.internet.email(),
      password: 'password123',
    };

    const newUser = await UserEntity.createNew(
      'Test User',
      mockData.email,
      mockData.password,
    );

    await userRepo.create(UserMapper.toPersistence(newUser));

    const result = await handler.execute(
      new SignInUserCommand(mockData.email, mockData.password),
    );

    expect(result).toHaveProperty('accessToken');

    const decoded = jwtService.decode<JWTPayload>(result.accessToken);
    expect(decoded).toHaveProperty('id', newUser.id.toString());
    expect(result).toHaveProperty('refreshToken');
  });

  it('should throw error for invalid credentials', async () => {
    const mockData = {
      email: faker.internet.email(),
      password: 'wrongpassword',
    };

    const newUser = await UserEntity.createNew(
      'Test User',
      mockData.email,
      'correctpassword',
    );
    await userRepo.create(UserMapper.toPersistence(newUser));

    await expect(
      handler.execute(new SignInUserCommand(mockData.email, mockData.password)),
    ).rejects.toThrow('Invalid credentials');
  });
});
