import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse the connection string to extract components
const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString!);

const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port) || 5432,
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  ssl: {
    rejectUnauthorized: false
  },
  max: 3,
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  application_name: 'taskio-backend'
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('Database connection error:', err);
});

// Retry logic for queries
export const query = async (text: string, params?: any[], retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error(`Query attempt ${i + 1} failed:`, error.message);

      if (i === retries - 1) {
        // If all retries failed, throw the error instead of using mock mode
        console.error('🚨 All database connection attempts failed. Throwing error.');
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const getClient = () => {
  return pool.connect();
};

export default pool;
