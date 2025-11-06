import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { UpdateBoardHandler } from 'src/board/application/commands/handlers/update-board.handler';
import { UpdateBoardCommand } from 'src/board/application/commands/update-board.command';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  team_members,
  teams,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { UserRepositoryInterface } from 'src/user/domain/ports/user.interface';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('update-board-handler integration', () => {
  let handler: UpdateBoardHandler;
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
        UpdateBoardHandler,
        BoardRepository,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: RefreshTokenRepository, useValue: refreshTokenRepo },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<UpdateBoardHandler>(UpdateBoardHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should update board', async () => {
    // Arrange
    const userDb = await userRepo.findByEmail(userFixture.email);

    if (!userDb) {
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
      user_id: userDb.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        name: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const updatedName = faker.lorem.words(4);
    const updatedDescription = faker.lorem.sentences(2);

    const command = new UpdateBoardCommand(
      newBoard.readable_id,
      updatedName,
      updatedDescription,
    );

    // Act
    await handler.execute(command);

    // Assert

    const [updatedBoard] = await db
      .select()
      .from(boards)
      .where(eq(boards.id, newBoard.id));

    expect(updatedBoard).toBeDefined();
    expect(updatedBoard.name).toBe(updatedName);
    expect(updatedBoard.description).toBe(updatedDescription);
  });
});
