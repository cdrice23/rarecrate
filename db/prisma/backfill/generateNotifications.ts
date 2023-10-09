import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateNotifications(): Promise<void> {
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
  const allFollowedFollows = allFollows.filter(follow =>
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
    let follows = allFollows.filter(follow => follow.followingId === profileData.profileId);
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

  // Create a notification for each profile anytime their crate gets favorited
  for (let profileData of allFollowerData) {
    let crates = allCrates.filter(crate => crate.creatorId === profileData.profileId);
    for (let crate of crates) {
      for (let profile of crate.favoritedBy) {
        await prisma.notification.create({
          data: {
            receiver: profileData.profileId,
            type: 'newFavorite',
            actionOwner: profile.id,
            notificationRef: crate.id,
          },
        });
      }
    }
  }

  // Create a notification for a profile's followers anytime the profile favorited a new crate
  for (let profileData of allFollowerData) {
    let crates = allCrates.filter(crate => crate.favoritedBy.some(profile => profile.id === profileData.profileId));
    for (let crate of crates) {
      for (let follower of profileData.followers) {
        await prisma.notification.create({
          data: {
            receiver: follower,
            type: 'newFavorite',
            actionOwner: profileData.profileId,
            notificationRef: crate.id,
          },
        });
      }
    }
  }
}
