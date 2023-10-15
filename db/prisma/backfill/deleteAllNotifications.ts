import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deleteAllNotifications(): Promise<void> {
  await prisma.notification.deleteMany({
    where: {
      id: {
        gt: 84764,
      },
    },
  });
}
