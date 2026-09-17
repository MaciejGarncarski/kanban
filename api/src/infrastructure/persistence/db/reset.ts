import { resetDB } from './reset-db.js';

resetDB()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
