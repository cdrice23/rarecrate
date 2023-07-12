const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  await prisma.follow.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
