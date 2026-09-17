import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { userFixture } from '../../../../../__tests__/fixtures/user.fixture.js';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { RefreshTokenRepository } from '../../../../../auth/infrastructure/persistence/refresh-token.repository.js';
import { DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  cards,
  comments,
  team_members,
  users,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { GetAllUsersHandler } from '../get-all-users.handler.js';
import { UserRepositoryInterface } from '../../../../domain/ports/user.interface.js';
import { UserRepository } from '../../../../infrastructure/persistence/user.repository.js';

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
