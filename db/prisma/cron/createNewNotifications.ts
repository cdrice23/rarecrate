import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const maxAttempts = 5;
const backoffInterval = 60000; // 1 minute

const retryWithBackoff = async (fn, attempts = 0) => {
  try {
    return await fn();
  } catch (error) {
    if (attempts >= maxAttempts) {
      console.log(`Max attempts reached. Exiting.`);
      throw error;
    }

    console.log(`Attempt ${attempts + 1} failed. Retrying in ${backoffInterval / 1000}s...`);
    await new Promise(resolve => setTimeout(resolve, backoffInterval * (attempts + 1)));
    return retryWithBackoff(fn, attempts + 1);
  }
};

const initCronRun = async () => {
  console.log('Starting cron job: Create new notifications');
  // Create current timestamp reference for CronRun
  const jobStart = new Date();

  // Get last CronRun and completedAt timestamp to compare new notifications
  const lastRun: any = await prisma.cronJob.findUnique({
    where: {
      id: 3,
    },
    include: {
      runs: {
        orderBy: {
          completedAt: 'desc',
        },
        take: 1,
      },
    },
  });

  let lastRunCompleted;

  if (lastRun.runs.length === 0) {
    // If there are no runs, set lastRunCompleted to be an hour before the jobStart time
    lastRunCompleted = new Date(jobStart.getTime() - 1 * 60 * 60 * 1000);
  } else {
    // If there are runs, set lastRunCompleted to be the completedAt time of the last run
    lastRunCompleted = lastRun.runs.completedAt;
  }

  console.log(`Last run completed at: ${lastRun.runs.length === 0 ? lastRunCompleted : lastRun.runs.completedAt}`);

  // get prisma records for Crate and Follow created at or after the timestamp
  const newCrates = await prisma.crate.findMany({
    where: {
      createdAt: {
        gte: lastRunCompleted,
      },
    },
  });

  const newFollows = await prisma.follow.findMany({
    where: {
      createdAt: {
        gte: lastRunCompleted,
      },
    },
  });

  // Create notifications
  // Create an array of objects capturing the followers of each profile
  let allFollowerData = [];

  for (let follow of newFollows) {
    let existingProfile = allFollowerData.find(profile => profile.profileId === follow.followingId);
    if (existingProfile) {
      existingProfile.followers.push(follow.followerId);
    } else {
      allFollowerData.push({ profileId: follow.followingId, followers: [follow.followerId] });
    }
  }

  // Create am array of all crates created by a profile with followers and create a notification for each follower
  const allFollowedCrates = newCrates.filter(crate => allFollowerData.some(data => data.profileId === crate.creatorId));

  for (let crate of allFollowedCrates) {
    let profileData = allFollowerData.find(data => data.profileId === crate.creatorId);
    for (let follower of profileData.followers) {
      await prisma.notification.create({
        data: {
          receiver: follower,
          type: 'newCrate',
          actionOwner: crate.creatorId,
          notificationRef: crate.id,
        },
      });
    }
  }

  // Create an array of all follows where the followerId is a profile in allFollowerData and create a notification for each profile's follower
  const allFollowedFollows = newFollows.filter(follow =>
    allFollowerData.some(data => data.profileId === follow.followerId),
  );

  for (let follow of allFollowedFollows) {
    let profileData = allFollowerData.find(data => data.profileId === follow.followerId);
    for (let follower of profileData.followers) {
      await prisma.notification.create({
        data: {
          receiver: follower,
          type: 'newFollow',
          actionOwner: follow.followerId,
          notificationRef: follow.id,
        },
      });
    }
  }

  // Create a notification for each profile in allFollowerData that someone followed them
  for (let profileData of allFollowerData) {
    let follows = newFollows.filter(follow => follow.followingId === profileData.profileId);
    for (let follow of follows) {
      await prisma.notification.create({
        data: {
          receiver: profileData.profileId,
          type: 'newFollow',
          actionOwner: follow.followerId,
          notificationRef: follow.id,
        },
      });
    }
  }

  // Log created notification length
  const totalNotificationsCreated = newCrates.length + newFollows.length;
  console.log(`Total notifications created: ${totalNotificationsCreated}`);

  // Delete any old notifications for profiles that have > 99999 notifications
  const allReceivers = await prisma.notification.groupBy({
    by: ['receiver'],
    _count: {
      receiver: true,
    },
  });

  const receiversWithManyNotifications = allReceivers.filter(receiver => receiver._count.receiver > 99999);

  for (const receiver of receiversWithManyNotifications) {
    // Get the receiver's notifications sorted by createdAt in ascending order
    const notificationsOverLimit = await prisma.notification.findMany({
      where: {
        receiver: receiver.receiver,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate the number of notifications to delete
    const notificationsToDelete = notificationsOverLimit.length - 99999;

    // Delete the first X notifications over 99999
    for (let i = 0; i < notificationsToDelete; i++) {
      await prisma.notification.delete({
        where: {
          id: notificationsOverLimit[i].id,
        },
      });
    }
  }

  if ((lastRun.lastProcessedItem === null || lastRun.lastProcessedItem !== '0') && totalNotificationsCreated > 0) {
    await prisma.cronRun.create({
      data: {
        createdAt: jobStart,
        completedAt: new Date(),
        lastProcessedItem: totalNotificationsCreated.toString(),
        cronJob: {
          connect: {
            id: 3,
          },
        },
      },
    });
  }
};

retryWithBackoff(initCronRun)
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
