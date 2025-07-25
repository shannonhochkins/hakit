import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
// for migrations
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
try {
  await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' });

  console.log('Successfully migrated the database!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
