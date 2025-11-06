import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { DeleteColumnCommand } from 'src/column/application/commands/delete-columnd.command';
import { DeleteColumnHandler } from 'src/column/application/commands/handlers/delete-column.handler';
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
import { teamRoles } from 'src/team/domain/types/team.types';
import { v7 } from 'uuid';

describe('delete-column-handler integration', () => {
  let handler: DeleteColumnHandler;
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
      imports: [TestConfigModule],
      providers: [
        DeleteColumnHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    handler = module.get<DeleteColumnHandler>(DeleteColumnHandler);
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

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: columnTitle,
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const command = new DeleteColumnCommand(newColumn.id);

    // Act
    await handler.execute(command);
    // Assert

    const deletedColumn = await columnRepo.findById(newColumn.id);
    expect(deletedColumn).toBeNull();
  });
});
