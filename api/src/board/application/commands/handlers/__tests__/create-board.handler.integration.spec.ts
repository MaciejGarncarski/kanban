import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { CreateBoardCommand } from 'src/board/application/commands/create-board.command';
import { CreateBoardHandler } from 'src/board/application/commands/handlers/create-board.handler';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import { team_members, teams } from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('create-board-handler integration', () => {
  let handler: CreateBoardHandler;
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
        CreateBoardHandler,
        BoardRepository,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<CreateBoardHandler>(CreateBoardHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should return created board', async () => {
    const firstUserFromDb = await userRepo.findByEmail(userFixture.email);

    if (!firstUserFromDb) {
      throw new Error('User not found');
    }

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: firstUserFromDb.id,
      role: 'admin',
    });

    const command = new CreateBoardCommand(
      firstUserFromDb.id,
      newTeam.readable_id,
      faker.lorem.words(3),
      faker.lorem.sentence(),
    );

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(command.name);
    expect(result.description).toBe(command.description);
    expect(result.teamId).toBe(newTeam.id);
  });
});
