import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshAccessTokenHandler } from 'src/auth/application/commands/handlers/refresh-access-token.handler';
import { RefreshAccessTokenCommand } from 'src/auth/application/commands/refresh-access-token.command';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('refresh-token-handler integration', () => {
  let handler: RefreshAccessTokenHandler;
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
        RefreshAccessTokenHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<RefreshAccessTokenHandler>(RefreshAccessTokenHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw error if refresh token is invalid', async () => {
    const command = new RefreshAccessTokenCommand('invalid-token');

    await expect(handler.execute(command)).rejects.toThrow(
      'Token not found or inactive',
    );
  });

  it('should refresh access token with valid refresh token', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const user = await userRepo.create({
      email,
      name: faker.person.fullName(),
      password_hash: await hash(password),
    });

    const { tokenPlain } = await refreshTokenRepo.create(user.id);

    const command = new RefreshAccessTokenCommand(tokenPlain);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('accessToken');
    expect(typeof result.accessToken).toBe('string');
  });
});
