import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { seed } from 'src/db/seed.js';

export async function resetDB() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('NO DATABASE_URL ENV');
  }

  const dbName = new URL(connectionString).pathname.slice(1);
  const rootClient = new Client({
    connectionString: connectionString.replace(`/${dbName}`, '/postgres'),
  });

  try {
    await rootClient.connect();
    console.log(`🧨 Dropping database ${dbName}...`);
    await rootClient.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`);

    console.log(`📦 Creating database ${dbName}...`);
    await rootClient.query(`CREATE DATABASE "${dbName}";`);
  } finally {
    await rootClient.end();
  }

  console.log('🚀 Running migrations...');
  const dbClient = new Client({ connectionString });
  await dbClient.connect();

  const db = drizzle(dbClient);
  await migrate(db, { migrationsFolder: 'drizzle' });

  console.log('✅ Database reset complete!');

  await dbClient.end();

  console.log('🌱 Seeding data...');
  await seed();

  console.log('✅ Database reset & seeded successfully!');
  await dbClient.end();
}
