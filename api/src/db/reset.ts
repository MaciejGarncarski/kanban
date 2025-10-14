import { resetDB } from 'src/db/reset-db';

resetDB()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
