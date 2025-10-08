import { reset } from 'drizzle-seed';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';

async function seed() {
  const db = drizzle(process.env.DATABASE_URL!);
  console.log(`ENV: ${process.env.DATABASE_URL!}`);

  console.log('----START DB RESET----');
  console.log('Cleaning old db data');
  await reset(db, schema);

  console.log('SEEDING USERS START');
  await db
    .insert(schema.usersTable)
    .values({ age: 18, email: 'test@test.pl', name: 'hello' });
  console.log('✅ SEEDING USERS DONE');

  console.log('✅  SUCCEESS  ✅');
  console.log('closing...');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
