import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prismaClientSingleton = () => {
  if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN) {
    const adapter = new PrismaLibSql({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter });
  } else {
    // Pass url directly if no adapter is used
    return new PrismaClient({
      datasources: {
        db: {
          url: 'file:./dev.db',
        },
      },
    });
  }
};

declare global {
  var prismaGlobal2: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal2 ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal2 = prisma;
