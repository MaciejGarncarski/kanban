import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  cards,
  comments,
  team_members,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { GetAllUsersHandler } from 'src/user/application/queries/handlers/get-all-users.handler';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';

describe('GetAllUsersHandler', () => {
  let handler: GetAllUsersHandler;
  let userRepo: UserRepositoryInterface;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule],
      providers: [
        GetAllUsersHandler,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<GetAllUsersHandler>(GetAllUsersHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should get all users', async () => {
    const result = await handler.execute();
    expect(result.length).toBe(2);
  });

  it('should get all users after adding one', async () => {
    await db.insert(users).values({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password_hash: hashSync('test'),
    });

    const result = await handler.execute();
    expect(result.length).toBe(3);
  });

  it('should get all users after deleting one', async () => {
    const [defaultUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, userFixture.email));

    await db.delete(comments).where(eq(comments.author_id, defaultUser.id));
    await db
      .delete(team_members)
      .where(eq(team_members.user_id, defaultUser.id));
    await db.delete(cards).where(eq(cards.assigned_to, defaultUser.id));
    await db.delete(users).where(eq(users.email, userFixture.email));

    const result = await handler.execute();
    // 2 because I add one before
    expect(result.length).toBe(2);
  });
});
