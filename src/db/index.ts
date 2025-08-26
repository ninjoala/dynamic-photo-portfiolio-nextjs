import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Environment variables are automatically loaded by Next.js from .env.local

// Use direct connection in production if available, otherwise use pooler
const connectionString = process.env.NODE_ENV === 'production' && process.env.DIRECT_DATABASE_URL
  ? process.env.DIRECT_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set - check .env.local file exists');
}

const isPgBouncer = connectionString?.includes('pooler.supabase.com') || false;

const client = postgres(connectionString, { 
  prepare: !isPgBouncer, // Disable prepare only for pooler
  ssl: 'require',
  max: 20,
  idle_timeout: 20,
  connect_timeout: 60
});
export const db = drizzle(client, { schema });