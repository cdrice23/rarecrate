import { PrismaClient } from '@prisma/client';

export async function deleteAllRecommendations(prisma: PrismaClient): Promise<void> {
  await prisma.recommendation.deleteMany();
}
