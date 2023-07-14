const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // await prisma.follow.deleteMany();
  // await prisma.profile.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.crate.deleteMany();
  await prisma.subgenre.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.tracklistItem.deleteMany();
  await prisma.album.deleteMany();
}
