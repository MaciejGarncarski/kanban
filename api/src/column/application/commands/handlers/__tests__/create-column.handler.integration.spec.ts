import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { RefreshTokenRepository } from 'src/auth/infrastructure/persistence/refresh-token.repository';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { CreateColumnCommand } from 'src/column/application/commands/create-column.command';
import { CreateColumnHandler } from 'src/column/application/commands/handlers/create-column.handler';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  columns,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { ProfanityCheckService } from 'src/infrastructure/services/profanity-check.service';
import { teamRoles } from 'src/team/domain/types/team.types';
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

    const columnTitle = faker.lorem.words(3);

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
