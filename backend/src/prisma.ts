import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
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
