import { Client, Pool } from 'pg';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { hash } from '@node-rs/argon2';
import { v7 } from 'uuid';

const connectionString = process.env.DATABASE_URL!;

export async function seed(pool?: Pool) {
  const client = pool
    ? new Client({
        host: pool.options.host,
        port: pool.options.port,
        user: pool.options.user,
        password: pool.options.password,
        database: 'kanban',
      })
    : new Client({ connectionString });

  await client.connect();
  const db = drizzle(client, { schema });

  const userId = v7();
  const defaultUser = {
    name: 'Default User',
    email: userFixture.email,
    id: userId,
    password_hash: await hash(userFixture.password),
  };

  const userId2 = v7();
  await db.insert(schema.users).values([
    defaultUser,
    {
      id: userId2,
      name: 'Bob',
      email: 'bob@example.com',
      password_hash:
        '$argon2id$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$v88qiYnV1bYFz0DzEJDxjA',
    },
  ]);

  const teamId = v7();
  const teamId2 = v7();

  await db.insert(schema.teams).values([
    {
      id: teamId,
      name: 'Awesome Team',
      description: 'This is an awesome team working on great projects.',
    },
    {
      id: teamId2,
      name: 'Developers',
      description: 'Team of software developers.',
    },
  ]);

  await db.insert(schema.team_members).values([
    {
      team_id: teamId,
      user_id: userId,
    },
    {
      team_id: teamId2,
      user_id: userId,
    },
    {
      team_id: teamId2,
      user_id: userId2,
    },
  ]);

  const boardId = v7();
  const boardId2 = v7();
  const boardId3 = v7();
  const boardId4 = v7();

  await db.insert(schema.boards).values([
    {
      id: boardId,
      team_id: teamId,
      description: 'Team Board',
      name: 'Project Alpha',
    },
    {
      id: boardId2,
      team_id: teamId,
      description: 'Dev Board',
      name: 'Backend Development',
    },
    {
      id: boardId3,
      team_id: teamId2,
      description: 'Frontend tasks and bugs',
      name: 'Frontend Development',
    },
    {
      id: boardId4,
      team_id: teamId2,
      description: 'Marketing strategies and plans',
      name: 'Marketing Board',
    },
  ]);

  const columnId1 = v7();
  const columnId2 = v7();
  const columnId3 = v7();

  await db.insert(schema.columns).values([
    {
      id: columnId1,
      board_id: boardId,
      position: 1,
      name: 'To Do',
    },
    {
      id: columnId2,
      board_id: boardId,
      position: 2,
      name: 'In Progress',
    },
    {
      id: columnId3,
      board_id: boardId,
      position: 3,
      name: 'Done',
    },
    {
      id: v7(),
      board_id: boardId2,
      position: 1,
      name: 'Backlog',
    },
    {
      id: v7(),
      board_id: boardId2,
      position: 2,
      name: 'In Development',
    },
    {
      id: v7(),
      board_id: boardId2,
      position: 3,
      name: 'Completed',
    },
    {
      id: v7(),
      board_id: boardId3,
      position: 1,
      name: 'To Do',
    },
  ]);

  const cardId1 = v7();
  const cardId2 = v7();
  const cardId3 = v7();

  await db.insert(schema.cards).values([
    {
      id: cardId1,
      column_id: columnId1,
      position: 1,
      title: 'Set up project repository',
      description: 'Initialize the Git repository and set up CI/CD',
      assigned_to: userId,
    },
    {
      id: cardId2,
      column_id: columnId1,
      position: 2,
      title: 'Design database schema',
      assigned_to: userId,
      description: 'Create ER diagrams and define relationships',
    },
    {
      id: cardId3,
      column_id: columnId2,
      position: 1,
      assigned_to: userId,
      title: 'Implement authentication',
      description: 'Set up user login and registration functionality',
    },
  ]);

  await db.insert(schema.comments).values([
    {
      card_id: cardId1,
      author_id: userId,
      content: 'This is a comment on card 1',
    },
    {
      card_id: cardId2,
      author_id: userId,
      content: 'This is a comment on card 2',
    },
  ]);

  await client.end();
}
