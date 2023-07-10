const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
