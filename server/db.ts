
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from "@shared/schema";

// Make sure we have a DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new pg.Pool({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'profitwise',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Add connection check
pool.query('SELECT 1').catch(err => {
  console.error('Initial database connection failed:', err);
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
