import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function randomizeCrateAndFollowDates(): Promise<void> {
  const startDate = new Date('2023-09-01T00:00:00.000Z');
  const endDate = new Date('2023-10-08T23:59:59.999Z');

  // Fetch all Crate records
  const crates = await prisma.crate.findMany();

  // Update the 'createdAt' field for each Crate record
  for (let crate of crates) {
    await prisma.crate.update({
      where: { id: crate.id },
      data: { createdAt: getRandomDate(startDate, endDate) },
    });
  }

  // Fetch all Follow records
  const follows = await prisma.follow.findMany();

  // Update the 'createdAt' field for each Follow record
  for (let follow of follows) {
    await prisma.follow.update({
      where: { id: follow.id },
      data: { createdAt: getRandomDate(startDate, endDate) },
    });
  }
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
