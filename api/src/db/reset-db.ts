import { drizzle } from 'drizzle-orm/node-postgres';
import { Client, Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { seed } from 'src/db/seed';

export async function resetDB(pgPool?: Pool) {
  if (pgPool) {
    const dbName = pgPool.options.database;

    const rootClient = new Client({
      host: pgPool.options.host,
      port: pgPool.options.port,
      user: pgPool.options.user,
      password: pgPool.options.password,
      database: 'postgres',
    });
    await rootClient.connect();

    try {
      console.log(`🧨 Dropping database ${dbName}...`);
      await rootClient.query(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`,
      );

      console.log(`📦 Creating database ${dbName}...`);
      await rootClient.query(`CREATE DATABASE "${dbName}";`);
    } finally {
      await rootClient.end();
    }

    console.log('🚀 Running migrations...');

    const db = drizzle(pgPool);

    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('✅ Database reset complete!');

    console.log('🌱 Seeding data...');
    await seed(pgPool);
    console.log('✅ Database reset & seeded successfully!');

    return;
  }

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

  console.log('🌱 Seeding data...');
  await seed();

  console.log('✅ Database reset & seeded successfully!');
  await dbClient.end();
}
