import { prisma } from './src/lib/prisma.js';

process.env.DATABASE_URL = "file:./dev.db";

async function main() {
  const propostas = await prisma.proposta.findMany();
  console.log('Success:', propostas.length);
}

main().catch(console.error);
