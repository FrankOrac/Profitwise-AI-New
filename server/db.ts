
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from "@shared/schema";

export const pool = new pg.Pool({
  user: process.env.NODE_ENV === 'production' ? 'your_prod_user' : 'postgres',
  host: process.env.NODE_ENV === 'production' ? 'your_prod_host' : 'localhost',
  database: process.env.NODE_ENV === 'production' ? 'your_prod_db' : 'profitwise',
  password: process.env.NODE_ENV === 'production' ? 'your_prod_password' : 'postgres',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Add connection check with retry mechanism
async function checkConnection(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connection successful');
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, err);
      console.error('Connection details:', {
        host: pool.options.host,
        database: pool.options.database,
        user: pool.options.user,
        ssl: pool.options.ssl
      });
      if (i < retries - 1) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.log('Continuing without database connection...');
  return false;
}

checkConnection();

// Add reconnection handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  checkConnection();
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
