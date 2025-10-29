import { Client, Pool } from 'pg';
import { seed } from 'src/infrastructure/persistence/db/seed';
import { migrateDB } from 'src/infrastructure/persistence/db/migrate-db';

function log(message: string) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(message);
  }
}

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
      log(`🧨 Dropping database ${dbName}...`);
      await rootClient.query(
        `DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`,
      );

      log(`📦 Creating database ${dbName}...`);
      await rootClient.query(`CREATE DATABASE "${dbName}";`);
    } finally {
      await rootClient.end();
    }

    log('🚀 Running migrations...');

    await migrateDB({ pool: pgPool });

    log('✅ Database reset complete!');

    log('🌱 Seeding data...');
    await seed(pgPool);
    log('✅ Database reset & seeded successfully!');

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
    log(`🧨 Dropping database ${dbName}...`);
    await rootClient.query(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE);`);

    log(`📦 Creating database ${dbName}...`);
    await rootClient.query(`CREATE DATABASE "${dbName}";`);
  } finally {
    await rootClient.end();
  }

  log('🚀 Running migrations...');

  const dbClient = new Client({ connectionString });
  await dbClient.connect();

  await migrateDB({ dbClient });

  log('✅ Database reset complete!');

  log('🌱 Seeding data...');
  await seed();

  log('✅ Database reset & seeded successfully!');
  await dbClient.end();
}
