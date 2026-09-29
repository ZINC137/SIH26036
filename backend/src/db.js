const { PrismaClient } = require('@prisma/client');

// Shared singleton Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Configure SQLite PRAGMAs for optimal concurrency when running on SQLite
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl || dbUrl.startsWith('file:') || dbUrl.includes('.db')) {
  prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;'))
    .then(() => {
      console.log('[DB] SQLite WAL mode & 10000ms busy_timeout verified.');
    })
    .catch((err) => {
      console.warn('[DB] SQLite PRAGMA initialization warning:', err.message);
    });
}

module.exports = prisma;
