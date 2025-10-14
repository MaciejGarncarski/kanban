import { Client } from 'pg';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';

const connectionString = process.env.DATABASE_URL!;

export async function seed() {
  const client = new Client({ connectionString });
  await client.connect();
  const db = drizzle(client, { schema });

  // pass is Abcd123
  await db.insert(schema.users).values([
    {
      name: 'Alice',
      email: 'alice@example.com',
      password_hash:
        '$argon2id$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$v88qiYnV1bYFz0DzEJDxjA',
    },
    {
      name: 'Bob',
      email: 'bob@example.com',
      password_hash:
        '$argon2id$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$v88qiYnV1bYFz0DzEJDxjA',
    },
  ]);

  console.log('✅ Seed data inserted!');
  await client.end();
}
