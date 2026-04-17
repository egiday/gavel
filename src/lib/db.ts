import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildClient() {
  // resolve `file:./dev.db` relative to the project root
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const stripped = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
  const abs = path.isAbsolute(stripped)
    ? stripped
    : path.join(process.cwd(), stripped);

  const adapter = new PrismaBetterSqlite3({ url: `file:${abs}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
