import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deleteDupeNotifs(): Promise<void> {
  const notifications = await prisma.notification.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });

  const duplicates = new Map();

  for (const notification of notifications) {
    const key = `${notification.actionOwner}-${notification.receiver}-${notification.crateId}-${notification.followId}`;

    if (duplicates.has(key)) {
      // If the key already exists in the map, this is a duplicate
      duplicates.get(key).push(notification.id);
    } else {
      // If the key does not exist in the map, add it with the id as the value
      duplicates.set(key, [notification.id]);
    }
  }

  // Now delete the duplicate records
  for (const [key, ids] of duplicates) {
    if (ids.length > 1) {
      // If there are duplicates, delete all but the first one
      await prisma.notification.deleteMany({
        where: {
          id: {
            in: ids.slice(1),
          },
        },
      });
    }
  }
}
