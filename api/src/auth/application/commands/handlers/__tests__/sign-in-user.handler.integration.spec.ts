import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { SignInUserHandler } from '../sign-in-user.handler.js';
import { SignInUserCommand } from '../../sign-in-user.command.js';
import { JWTPayload } from '../../../../domain/token.types.js';
import { RefreshTokenRepository } from '../../../../infrastructure/persistence/refresh-token.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserEntity } from '../../../../../user/domain/user.entity.js';
import { UserMapper } from '../../../../../user/infrastructure/persistence/mappers/user.mapper.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';

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
    expect(decoded).toHaveProperty('sub', newUser.id.toString());
    expect(result).toHaveProperty('refreshToken');
  });

  it('should throw error if user does not exist', async () => {
    const mockData = {
      email: faker.internet.email(),
      password: 'password123',
    };

    await expect(
      handler.execute(new SignInUserCommand(mockData.email, mockData.password)),
    ).rejects.toThrow('Invalid credentials');
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
