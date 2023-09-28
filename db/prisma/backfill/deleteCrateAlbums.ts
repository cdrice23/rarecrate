import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deleteCrateAlbums(): Promise<void> {
  await prisma.crateAlbum.deleteMany({
    where: {
      id: {
        gt: 2547,
      },
    },
  });
}
