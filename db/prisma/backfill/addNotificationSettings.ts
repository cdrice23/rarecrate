import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function addNotificationSettings(): Promise<void> {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const notificationSettings = await prisma.notificationSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!notificationSettings) {
      await prisma.notificationSettings.create({
        data: {
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }
  }
}
