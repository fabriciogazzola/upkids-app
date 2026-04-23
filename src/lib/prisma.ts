import { PrismaClient } from "@prisma/client";

// O PrismaClient é instanciado dessa forma para evitar que o Next.js
// abra conexões demais com o banco de dados durante o desenvolvimento (Hot Reload).
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;