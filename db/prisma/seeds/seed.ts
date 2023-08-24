import { main as bigUserSeed } from './bigUserSeed';
import { main as resetDb } from './resetDb';
import { main as bigCrateSeed } from './bigCrateSeed';
import { main as albumSeed } from './albumSeed';
import { main as connectAlbumSeed } from './connectAlbumSeed';
import { main as getAlbumImageUrls } from './getAlbumImageUrls';
import { fixTagDuplicates } from '../backfill/fixTagDuplicates';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // await bigUserSeed();
  // await bigCrateSeed();
  // await albumSeed();
  // await connectAlbumSeed();
  // await getAlbumImageUrls();
  // await resetDb();
  await fixTagDuplicates();
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
