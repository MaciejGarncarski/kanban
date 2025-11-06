import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { UpdateColumnHandler } from 'src/column/application/commands/handlers/update-column.handler';
import { UpdateColumnCommand } from 'src/column/application/commands/update-column.command';
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
import { GetRoleByColumnIdHandler } from 'src/user/application/queries/handlers/get-role-by-column-id.handler';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('update-column-handler integration', () => {
  let handler: UpdateColumnHandler;
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let db: DB;
  let columnRepo: ColumnRepository;
  let userRepo: UserRepository;

  beforeAll(async () => {
    const { pgContainer, pgPool, testDb } = await getTestDb();
    container = pgContainer;
    pool = pgPool;

    db = testDb;
    columnRepo = new ColumnRepository(testDb);
    userRepo = new UserRepository(testDb);
  });

  afterAll(async () => {
    await stopTestDb(container, pool);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestConfigModule, CqrsModule],
      providers: [
        UpdateColumnHandler,
        GetRoleByColumnIdHandler,
        BoardRepository,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<UpdateColumnHandler>(UpdateColumnHandler);
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

    const command = new UpdateColumnCommand(
      newUser.id,
      newColumn.id,
      'Updated Title',
    );

    // Act
    const updated = await handler.execute(command);
    // Assert

    expect(updated).toBeDefined();
    expect(updated.name).toBe('Updated Title');
    expect(updated.id).toBe(newColumn.id);
  });

  it('should throw error when column does not exist', async () => {
    // Arrange
    const command = new UpdateColumnCommand(v7(), v7(), 'Updated Title');

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow('Column not found');
  });

  it('should throw error when user is not admin', async () => {
    // Arrange

    const [newUser] = await db
      .insert(users)
      .values({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password_hash: await hash(faker.internet.password()),
      })
      .returning();

    const [anotherUser] = await db
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

    await db.insert(team_members).values({
      team_id: newTeam.id,
      user_id: anotherUser.id,
      role: teamRoles.MEMBER,
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

    const command = new UpdateColumnCommand(
      anotherUser.id,
      newColumn.id,
      'Updated Title',
    );

    // Act & Assert
    await expect(handler.execute(command)).rejects.toThrow(
      'User is not authorized to update this team',
    );
  });
});
