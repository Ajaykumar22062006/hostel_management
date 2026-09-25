import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma Client instances in serverless (hot reload) environments
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
