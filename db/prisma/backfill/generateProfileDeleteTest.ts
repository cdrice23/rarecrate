import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateProfileDeleteTest(): Promise<void> {
  const profileToEventuallyDelete = await prisma.profile.create({
    data: {
      userId: 1320,
      username: 'christhefated',
      bio: `About to be RATIO'd, son.`,
      isPrivate: true,
      favorites: {
        connect: {
          id: 490,
        },
      },
    },
  });

  const profileIdToEventuallyDelete = profileToEventuallyDelete.id;

  // Create a Follow where the followerId is test Profile and the followingId is 661
  await prisma.follow.create({
    data: {
      followerId: profileIdToEventuallyDelete,
      followingId: 661,
    },
  });

  // Create a Follow where the followerId is 648 and the followingId is test Profile
  await prisma.follow.create({
    data: {
      followerId: 648,
      followingId: profileIdToEventuallyDelete,
    },
  });

  // Create a FollowRequest where senderId is test Profile and the followingId is 660
  await prisma.followRequest.create({
    data: {
      senderId: profileIdToEventuallyDelete,
      receiverId: 660,
      requestStatus: 'PENDING',
      sentAt: new Date(),
    },
  });

  // Create a FollowRequest where senderId is 656 and the followingId is test Profile
  await prisma.followRequest.create({
    data: {
      senderId: 656,
      receiverId: profileIdToEventuallyDelete,
      requestStatus: 'PENDING',
      sentAt: new Date(),
    },
  });

  // Create a SocialLink where the connected profileId is test Profile, the platform is "TWITTER" and the username is "test"
  await prisma.socialLink.create({
    data: {
      profileId: profileIdToEventuallyDelete,
      platform: 'TWITTER',
      username: 'test',
    },
  });

  // Create a Crate where the creatorId is test Profile with favorited by
  const crate = await prisma.crate.create({
    data: {
      title: 'Soon to Be Deleted',
      creatorId: profileIdToEventuallyDelete,
      favoritedBy: {
        connect: [{ id: 661 }, { id: 648 }, { id: 660 }, { id: 658 }],
      },
    },
  });

  // Create CrateAlbums and connect them to the Crate created in #7 - the following Album ids should be used for each created CrateAlbum - 9, 10, 11, 12, 13
  await prisma.crateAlbum.createMany({
    data: [
      { crateId: crate.id, albumId: 9 },
      { crateId: crate.id, albumId: 10 },
      { crateId: crate.id, albumId: 11 },
      { crateId: crate.id, albumId: 12 },
      { crateId: crate.id, albumId: 13 },
    ],
  });

  // Create a Recommendation where the profileId is test Profile. The crateId should be 332.
  await prisma.recommendation.create({
    data: {
      profileId: profileIdToEventuallyDelete,
      crateId: 332,
      seen: false,
      createdAt: new Date(),
    },
  });
}
