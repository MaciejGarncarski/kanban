import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { LogoutHandler } from '../logout.handler.js';
import { LogoutCommand } from '../../logout.command.js';
import { RefreshTokenRepository } from '../../../../infrastructure/persistence/refresh-token.repository.js';
import { DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
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
        LogoutHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<LogoutHandler>(LogoutHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should revoke existing token', async () => {
    const user = await userRepo.create({
      email: 'test@example.com',
      password_hash: hashSync('Abcd1234'),
      name: 'Test User',
    });

    const token = await refreshTokenRepo.create(user.id);

    const result = await handler.execute(new LogoutCommand(token.tokenPlain));
    expect(result).toBe(true);

    const found = await refreshTokenRepo.findActiveByToken(token.tokenPlain);
    expect(found).toBeNull();
  });

  it('should handle non-existing token gracefully', async () => {
    const result = await handler.execute(
      new LogoutCommand('non-existing-token'),
    );
    expect(result).toBeUndefined();
  });
});
