const { PrismaClient } = require('@prisma/client');

// Shared singleton Prisma client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Configure SQLite PRAGMAs for optimal concurrency
// WAL mode allows multiple readers during writes, and busy_timeout gives transactions 10s to acquire locks
prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
  .then(() => prisma.$queryRawUnsafe('PRAGMA busy_timeout = 10000;'))
  .then(() => {
    console.log('[DB] SQLite WAL mode & 10000ms busy_timeout verified.');
  })
  .catch((err) => {
    console.warn('[DB] SQLite PRAGMA initialization warning:', err.message);
  });

module.exports = prisma;
