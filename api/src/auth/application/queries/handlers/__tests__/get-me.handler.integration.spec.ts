import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { GetMeHandler } from '../get-me.handler.js';
import { RefreshTokenRepository } from '../../../../infrastructure/persistence/refresh-token.repository.js';
import { DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('GetMe', () => {
  let handler: GetMeHandler;
  let userRepo: UserRepositoryInterface;
  let refreshTokenRepo: RefreshTokenRepository;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

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
        GetMeHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetMeHandler>(GetMeHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should return current user', async () => {
    // Arrange
    const user = await userRepo.create({
      email: 'test@example.com',
      password_hash: await hash('securepassword'),
      name: 'Test User',
    });

    // Act
    const result = await handler.execute({ userId: user.id });

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
    expect(result.email).toBe('test@example.com');
  });

  it('should throw UnauthorizedException if user not found', async () => {
    await expect(handler.execute({ userId: v7() })).rejects.toThrow(
      'User not found',
    );
  });
});
