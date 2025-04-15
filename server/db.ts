
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from "@shared/schema";

export const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'profitwise',
  password: 'postgres',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Add connection check
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('Initial database connection failed:', err);
    console.error('Connection details:', {
      host: pool.options.host,
      database: pool.options.database,
      user: pool.options.user,
      ssl: pool.options.ssl
    });
  });

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Run migrations
export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Initialize database
export async function initializeDatabase() {
  await runMigrations();
  if (process.env.NODE_ENV === 'development') {
    // Run seeder in development
    await import('./seed');
  }
}
