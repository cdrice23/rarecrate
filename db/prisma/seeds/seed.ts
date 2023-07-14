import { main as bigUserSeed } from './bigUserSeed';
import { main as resetDb } from './resetDb';
import { main as bigCrateSeed } from './bigCrateSeed';
import { main as albumSeed } from './albumSeed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await bigUserSeed();
  // await bigCrateSeed();
  await albumSeed();
  // await resetDb();
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
