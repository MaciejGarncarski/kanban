import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { LogoutHandler } from 'src/auth/application/commands/handlers/logout.handler';
import { LogoutCommand } from 'src/auth/application/commands/logout.command';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('LogoutHandler', () => {
  let handler: LogoutHandler;
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
    jwtService = module.get<JwtService>(JwtService);
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
});
