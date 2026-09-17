import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
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
import { RefreshTokenRepository } from '../../../../../auth/infrastructure/persistence/refresh-token.repository.js';
import { BoardRepository } from '../../../../../board/infrastructure/persistence/board.repository.js';
import { CreateColumnCommand } from '../../create-column.command.js';
import { CreateColumnHandler } from '../create-column.handler.js';
import { ColumnRepository } from '../../../../infrastructure/persistence/column.repository.js';
import { type DB } from '../../../../../infrastructure/persistence/db/client.js';
import { DB_PROVIDER } from '../../../../../infrastructure/persistence/db/db.provider.js';
import {
  boards,
  columns,
  team_members,
  teams,
  users,
} from '../../../../../infrastructure/persistence/db/schema.js';
import { generateReadableId } from '../../../../../infrastructure/persistence/generate-readable-id.js';
import { ProfanityCheckService } from '../../../../../infrastructure/services/profanity-check.service.js';
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
import { v7 } from 'uuid';

describe('create-column-handler integration', () => {
  let handler: CreateColumnHandler;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;
  let columnRepo: ColumnRepository;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    columnRepo = new ColumnRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, CqrsModule],
      providers: [
        CreateColumnHandler,
        BoardRepository,
        ProfanityCheckService,
        RefreshTokenRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<CreateColumnHandler>(CreateColumnHandler);
  });

  it('should create a new column', async () => {
    // Arrange

    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

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
      user_id: newUser.id,
      role: teamRoles.ADMIN,
    });

    const [newBoard] = await db
      .insert(boards)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        team_id: newTeam.id,
        readable_id: generateReadableId(),
      })
      .returning();

    const columnTitle = 'To Do';

    const command = new CreateColumnCommand(columnTitle, newBoard.readable_id);

    // Act
    const result = await handler.execute(command);
    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(command.title);
    expect(result.boardId).toBe(newBoard.id);
  });

  it('should throw BadRequestException if column with the same name exists in the board', async () => {
    // Arrange
    const boardId = v7();
    const boardReadableId = generateReadableId();
    const columnTitle = faker.lorem.words(3);

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(boards).values({
      id: boardId,
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      team_id: newTeam.id,
      readable_id: boardReadableId,
    });

    await db.insert(columns).values({
      id: v7(),
      name: columnTitle,
      board_id: boardId,
      position: 1,
    });

    const command = new CreateColumnCommand(columnTitle, boardReadableId);

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Column with this name already exists in the board.',
    );
  });

  it('should throw BadRequestException if maximum number of columns is reached for the board', async () => {
    // Arrange
    const boardId = v7();
    const boardReadableId = generateReadableId();

    const [newTeam] = await db
      .insert(teams)
      .values({
        id: v7(),
        name: faker.company.name(),
        description: faker.lorem.sentence(),
        readable_id: generateReadableId(),
      })
      .returning();

    await db.insert(boards).values({
      id: boardId,
      name: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      team_id: newTeam.id,
      readable_id: boardReadableId,
    });

    const colCount = 10;

    await Promise.all(
      Array.from({ length: colCount }).map((_, index) =>
        db.insert(columns).values({
          id: v7(),
          name: `Column ${index + 1}`,
          board_id: boardId,
          position: index + 1,
        }),
      ),
    );

    const command = new CreateColumnCommand(
      'New Column Beyond Limit',
      boardReadableId,
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'Maximum number of columns reached for this board.',
    );
  });
});
