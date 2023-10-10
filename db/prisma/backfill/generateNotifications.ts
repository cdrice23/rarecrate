import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateNotifications(): Promise<void> {
  const startDate = new Date('2023-09-01T00:00:00.000Z');
  const endDate = new Date('2023-10-08T23:59:59.999Z');

  // Get all crates and follows from the db
  const allCrates = await prisma.crate.findMany({
    include: {
      favoritedBy: true,
    },
  });
  const allFollows = await prisma.follow.findMany();

  // Create an array of objects capturing the followers of each profile
  let allFollowerData = [];

  for (let follow of allFollows) {
    let existingProfile = allFollowerData.find(profile => profile.profileId === follow.followingId);
    if (existingProfile) {
      existingProfile.followers.push(follow.followerId);
    } else {
      allFollowerData.push({ profileId: follow.followingId, followers: [follow.followerId] });
    }
  }

  // Create am array of all crates created by a profile with followers and create a notification for each follower
  const allFollowedCrates = allCrates.filter(crate => allFollowerData.some(data => data.profileId === crate.creatorId));

  console.log('Now generating notifications for creating a new crate');
  for (let crate of allFollowedCrates) {
    let profileData = allFollowerData.find(data => data.profileId === crate.creatorId);
    for (let follower of profileData.followers) {
      await prisma.notification.create({
        data: {
          receiver: follower,
          createdAt: crate.createdAt,
          type: 'newCrate',
          actionOwner: crate.creatorId,
          connectedCrate: {
            connect: {
              id: crate.id,
            },
          },
        },
      });
    }
  }

  // Create an array of all follows where the followerId is a profile in allFollowerData and create a notification for each profile's follower
  const allFollowedFollows = allFollows.filter(follow =>
    allFollowerData.some(data => data.profileId === follow.followerId),
  );

  console.log('Now generating notifications for followers when profile follows someone');
  for (let follow of allFollowedFollows) {
    let profileData = allFollowerData.find(data => data.profileId === follow.followerId);
    for (let follower of profileData.followers) {
      await prisma.notification.create({
        data: {
          receiver: follower,
          createdAt: follow.createdAt,
          type: 'newFollow',
          actionOwner: follow.followerId,
          connectedFollow: {
            connect: {
              id: follow.id,
            },
          },
        },
      });
    }
  }

  // Create a notification for each profile in allFollowerData that someone followed them
  console.log('Now generating notifications for profiles when they are followed');
  for (let profileData of allFollowerData) {
    let follows = allFollows.filter(follow => follow.followingId === profileData.profileId);
    for (let follow of follows) {
      await prisma.notification.create({
        data: {
          receiver: profileData.profileId,
          createdAt: follow.createdAt,
          type: 'newFollow',
          actionOwner: follow.followerId,
          connectedFollow: {
            connect: {
              id: follow.id,
            },
          },
        },
      });
    }
  }

  // Create a notification for each profile anytime their crate gets favorited
  console.log('Now generating notifications for profiles when their crate gets favorited');
  for (let profileData of allFollowerData) {
    let crates = allCrates.filter(crate => crate.creatorId === profileData.profileId);
    for (let crate of crates) {
      for (let profile of crate.favoritedBy) {
        const randomDate = getRandomDate(startDate, endDate);
        await prisma.notification.create({
          data: {
            receiver: profileData.profileId,
            createdAt: randomDate,
            type: 'newFavorite',
            actionOwner: profile.id,
            connectedCrate: {
              connect: {
                id: crate.id,
              },
            },
          },
        });
      }
    }
  }

  // Create a notification for a profile's followers anytime the profile favorited a new crate
  console.log(`Now generating notifications for a profile's followers when they favorite a crate`);
  for (let profileData of allFollowerData) {
    let crates = allCrates.filter(crate => crate.favoritedBy.some(profile => profile.id === profileData.profileId));
    for (let crate of crates) {
      for (let follower of profileData.followers) {
        const randomDate = getRandomDate(startDate, endDate);
        await prisma.notification.create({
          data: {
            receiver: follower,
            createdAt: randomDate,
            type: 'newFavorite',
            actionOwner: profileData.profileId,
            connectedCrate: {
              connect: {
                id: crate.id,
              },
            },
          },
        });
      }
    }
  }
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
