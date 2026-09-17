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
import { BoardRepository } from '../../../../../board/infrastructure/persistence/board.repository.js';
import { DeleteColumnCommand } from '../../delete-columnd.command.js';
import { DeleteColumnHandler } from '../delete-column.handler.js';
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
import { teamRoles } from '../../../../../team/domain/types/team.types.js';
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
      imports: [TestConfigModule, CqrsModule],
      providers: [
        DeleteColumnHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();
    await module.init();

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
