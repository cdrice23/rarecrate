import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAlbums() {
  
}

getAlbums()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
