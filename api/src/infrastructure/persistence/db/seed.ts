import { Client, Pool } from 'pg';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { userFixture } from 'src/__tests__/fixtures/user.fixture';
import { hash } from '@node-rs/argon2';

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

  const defaultUser = {
    name: 'Default User',
    email: userFixture.email,
    password_hash: await hash(userFixture.password),
  };

  await db.insert(schema.users).values([
    defaultUser,
    {
      name: 'Bob',
      email: 'bob@example.com',
      password_hash:
        '$argon2id$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$v88qiYnV1bYFz0DzEJDxjA',
    },
  ]);

  await client.end();
}
