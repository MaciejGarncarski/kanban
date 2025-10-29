import { Client } from 'pg';
import { migrateDB } from 'src/infrastructure/persistence/db/migrate-db';

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  const dbClient = new Client({ connectionString });

  try {
    await dbClient.connect();
    await migrateDB({ dbClient });
    console.log('Migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await dbClient.end();
    process.exit(0);
  }
}

runMigrations()
  .then(() => {
    console.log('Migrations completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
