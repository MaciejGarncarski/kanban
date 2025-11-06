import { faker } from '@faker-js/faker';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from '@node-rs/argon2';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql/build/postgresql-container';
import { eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { createJWTService } from 'src/__tests__/utils/create-jwt-service';
import { getTestDb, stopTestDb } from 'src/__tests__/utils/get-test-db';
import { TestConfigModule } from 'src/__tests__/utils/get-test-env';
import { BoardRepository } from 'src/board/infrastructure/persistence/board.repository';
import { DeleteCardCommand } from 'src/card/application/commands/delete-card.command';
import { DeleteCardHandler } from 'src/card/application/commands/handlers/delete-card.handler';
import { CardRepository } from 'src/card/infrastructure/persistence/card.repository';
import { ColumnRepository } from 'src/column/infrastructure/persistence/column.repository';
import { type DB } from 'src/infrastructure/persistence/db/client';
import { DB_PROVIDER } from 'src/infrastructure/persistence/db/db.provider';
import {
  boards,
  cards,
  columns,
  team_members,
  teams,
  users,
} from 'src/infrastructure/persistence/db/schema';
import { generateReadableId } from 'src/infrastructure/persistence/generate-readable-id';
import { teamRoles } from 'src/team/domain/types/team.types';
import { GetRoleByColumnIdHandler } from 'src/user/application/queries/handlers/get-role-by-column-id.handler';
import { GetRoleByTeamIdHandler } from 'src/user/application/queries/handlers/get-role-by-team-id.handler';
import { UserRepository } from 'src/user/infrastructure/persistence/user.repository';
import { v7 } from 'uuid';

describe('delete-card-handler integration', () => {
  let handler: DeleteCardHandler;
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
        DeleteCardHandler,
        BoardRepository,
        CardRepository,
        GetRoleByTeamIdHandler,
        GetRoleByColumnIdHandler,
        { provide: DB_PROVIDER, useValue: db },
        { provide: UserRepository, useValue: userRepo },
        { provide: ColumnRepository, useValue: columnRepo },
        createJWTService(),
      ],
    }).compile();

    await module.init();

    handler = module.get<DeleteCardHandler>(DeleteCardHandler);
  });

  it('should delete a card', async () => {
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

    const cardTitle = faker.lorem.words(3);

    const [newColumn] = await db
      .insert(columns)
      .values({
        id: v7(),
        name: faker.lorem.words(2),
        board_id: newBoard.id,
        position: 1,
      })
      .returning();

    const [newCard] = await db
      .insert(cards)
      .values({
        id: v7(),
        title: cardTitle,
        description: faker.lorem.sentence(),
        column_id: newColumn.id,
        position: 1,
      })
      .returning();

    const command = new DeleteCardCommand(newUser.id, newCard.id);

    // Act
    await handler.execute(command);
    // Assert

    const [deletedCard] = await db
      .select()
      .from(cards)
      .where(eq(cards.id, newCard.id));

    expect(deletedCard).toBeUndefined();
  });
});
