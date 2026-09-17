import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
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
import { UpdateBoardHandler } from '../update-board.handler.js';
import { UpdateBoardCommand } from '../../update-board.command.js';
import { BoardRepository } from '../../../../infrastructure/persistence/board.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  boards,
  team_members,
  teams,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('update-board-handler integration', () => {
  let handler: UpdateBoardHandler;
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
      imports: [TestConfigModule, CqrsModule],
      providers: [
        ProfanityCheckService,
        UpdateBoardHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

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

  it('should throw error when board name is profane', async () => {
    const command = new UpdateBoardCommand(v7(), 'fuck');

    await expect(handler.execute(command)).rejects.toThrow(
      'Board title contains inappropriate language.',
    );
  });

  it('should throw error when board description is profane', async () => {
    const command = new UpdateBoardCommand(v7(), 'A valid name', 'fuck');

    await expect(handler.execute(command)).rejects.toThrow(
      'Board description contains inappropriate language.',
    );
  });
});
