import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "helena.united@gmail.com";
  const hashedPassword = await bcrypt.hash("pensou@2024", 10);

  const helena = await prisma.colaborador.upsert({
    where: { email: adminEmail },
    update: {
      senha: hashedPassword,
      role: "admin",
      funcao: "Admin",
    },
    create: {
      nome: "Helena Bezerra",
      email: adminEmail,
      telefone: "(11) 99999-9999",
      funcao: "Admin",
      senha: hashedPassword,
      role: "admin",
    },
  });

  console.log({ helena });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
