import { PrismaClient } from '@prisma/client';

export async function testSeenReset(prisma: PrismaClient): Promise<void> {
  const recordsToUpdate = await prisma.recommendation.findMany({
    where: {
      profileId: 647,
    },
    skip: 72,
    select: {
      id: true,
    },
  });

  await prisma.recommendation.updateMany({
    where: {
      id: {
        in: recordsToUpdate.map(record => record.id),
      },
    },
    data: {
      seen: true,
    },
  });

  // Alt to reset all to false
  // await prisma.recommendation.updateMany({
  //   where: {
  //     profileId: 647
  //   },
  //   data: {
  //     seen: false
  //   }
  // });
}
