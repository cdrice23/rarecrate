import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fixNotificationDates(): Promise<void> {
  const startDate = new Date('2023-09-01T00:00:00.000Z');
  const endDate = new Date('2023-10-08T23:59:59.999Z');

  // Fetch all Notification records
  const notifications = await prisma.notification.findMany();

  // Loop through each Notification and update based on type
  for (const notification of notifications) {
    if (notification.type === 'newCrate') {
      // Find the corresponding Crate
      const crate = await prisma.crate.findUnique({
        where: { id: notification.notificationRef },
      });

      // Update the createdBy field of the Notification
      await prisma.notification.update({
        where: { id: notification.id },
        data: { createdAt: crate.createdAt },
      });
    } else if (notification.type === 'newFollow') {
      // Find the corresponding Follow
      const follow = await prisma.follow.findUnique({
        where: { id: notification.notificationRef },
      });

      // Update the createdBy field of the Notification
      await prisma.notification.update({
        where: { id: notification.id },
        data: { createdAt: follow.createdAt },
      });
    } else if (notification.type === 'newFavorite') {
      // Generate a random date
      const randomDate = getRandomDate(startDate, endDate);

      // Update the createdBy field of the Notification
      await prisma.notification.update({
        where: { id: notification.id },
        data: { createdAt: randomDate },
      });
    }
  }
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
