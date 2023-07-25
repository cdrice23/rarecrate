const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // await prisma.follow.deleteMany();
  // await prisma.profile.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.crate.deleteMany();
  // await prisma.subgenre.deleteMany();
  // await prisma.genre.deleteMany();
  // await prisma.tracklistItem.deleteMany();
  // await prisma.album.deleteMany();
  // await prisma.tag.deleteMany();
  // const albums = await prisma.album.findMany();

  // for (const album of albums) {
  //   await prisma.album.update({
  //     where: { id: album.id },
  //     data: { imageUrl: undefined },
  //   });
  // }
  // await prisma.recordLabel.deleteMany();
  await prisma.tracklistItem.deleteMany({
    where: {
      id: {
        gte: 8917,
      },
    },
  });
  await prisma.album.deleteMany({
    where: {
      id: {
        gte: 709,
      },
    },
  });
}
