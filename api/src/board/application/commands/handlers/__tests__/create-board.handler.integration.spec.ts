import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';
import { userFixture } from '../../../../../__tests__/fixtures/user.fixture.js';
import { createJWTService } from '../../../../../__tests__/utils/create-jwt-service.js';
import {
  getTestDb,
  stopTestDb,
} from '../../../../../__tests__/utils/get-test-db.js';
import { TestConfigModule } from '../../../../../__tests__/utils/get-test-env.js';
import { CreateBoardCommand } from '../../create-board.command.js';
import { CreateBoardHandler } from '../create-board.handler.js';
import { BoardRepository } from '../../../../infrastructure/persistence/board.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  team_members,
  teams,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { UserRepositoryInterface } from '../../../../../user/domain/ports/user.interface.js';
import { UserRepository } from '../../../../../user/infrastructure/persistence/user.repository.js';
import { v7 } from 'uuid';

describe('create-board-handler integration', () => {
  let handler: CreateBoardHandler;
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
        ProfanityCheckService,
        CreateBoardHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<CreateBoardHandler>(CreateBoardHandler);
    userRepo = module.get<UserRepositoryInterface>(UserRepository);
  });

  it('should throw error when board name is profane', async () => {
    const command = new CreateBoardCommand(
      v7(),
      'team-123',
      'fuck',
      'A valid description',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Board name contains inappropriate language.',
    );
  });

  it('should throw error when board description is profane', async () => {
    const command = new CreateBoardCommand(
      v7(),
      'team-123',
      'A valid name',
      'fuck',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Board description contains inappropriate language.',
    );
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
      role: teamRoles.ADMIN,
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
