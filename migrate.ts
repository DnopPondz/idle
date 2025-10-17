// migrate.ts
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './src/lib/server/db';

// This will run migrations on the database, creating the tables you need
async function main() {
  try {
    await migrate(db, { migrationsFolder: 'drizzle' });
    console.log('Tables migrated!');
    process.exit(0);
  } catch (error) {
    console.error('Error migrating tables:', error);
    process.exit(1);
  }
}

main();