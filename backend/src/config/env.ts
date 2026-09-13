import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'realm_rpg_super_secret_jwt_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

if (!ENV.DATABASE_URL) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set in backend/.env!');
}
