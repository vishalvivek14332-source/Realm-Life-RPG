import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend .env and root .env are loaded before Prisma initialization
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

function sanitizePgBouncerUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    // Enforce pgbouncer=true to disable prepared statement cache on transaction poolers
    parsed.searchParams.set('pgbouncer', 'true');
    // Enforce sslmode=require for secure Supabase cloud connections
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    let sanitized = rawUrl;
    if (!sanitized.includes('pgbouncer=true')) {
      sanitized += (sanitized.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }
    if (!sanitized.includes('sslmode=')) {
      sanitized += (sanitized.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    return sanitized;
  }
}

const dbUrl = sanitizePgBouncerUrl(process.env.DATABASE_URL || '');
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

export const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

/**
 * Health check utility to probe database connectivity and measure latency
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    // Lightweight raw SQL query to test active pool connection
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'Database connection error'
    };
  }
}

// Graceful connection teardown on process exit
const handleShutdown = async (signal: string) => {
  try {
    await prisma.$disconnect();
    console.log(`🔌 Prisma safely disconnected upon ${signal}`);
  } catch (e) {
    console.error(`Error disconnecting Prisma on ${signal}:`, e);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export default prisma;
