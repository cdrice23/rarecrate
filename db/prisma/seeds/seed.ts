import { main as bigUserSeed } from './bigUserSeed';
import { main as resetDb } from './resetDb';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await bigUserSeed();
  // await resetDb()
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
