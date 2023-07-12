import { userSeedArray as users } from '../../../core/constants/seedHelpers/user';
import { profileSeedArray as profiles } from '../../../core/constants/seedHelpers/profile';
import { followSeedArray as follows } from '../../../core/constants/seedHelpers/follow';
import { followRequestSeedArray as followRequests } from '../../../core/constants/seedHelpers/followRequest';
import { socialLinkSeedArray as socialLinks } from '../../../core/constants/seedHelpers/socialLink';
import { crateSeedArray as crates } from '../../../core/constants/seedHelpers/crate';
import { labelSeedArray as labels } from '../../../core/constants/seedHelpers/label';
import { crateAlbumSeedArray as crateAlbums } from '../../../core/constants/seedHelpers/crateAlbum';
import { tagSeedArray as tags } from '../../../core/constants/seedHelpers/tag';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // // Create users and profiles
  // for (let user of users) {
  //   const createdUser = await prisma.user.create({
  //     data: {
  //       email: user.email,
  //       emailVerified: user.emailverified,
  //       role: user.role,
  //     },
  //   });

  //   const matchedProfile = profiles.find(p => p.userid === user.id);

  //   if (matchedProfile) {
  //     const existingProfile = await prisma.profile.findFirst({
  //       where: {
  //         username: matchedProfile.username,
  //         isPrivate: matchedProfile.isprivate,
  //         bio: matchedProfile.bio,
  //       },
  //     });

  //     if (existingProfile) {
  //       await prisma.user.update({
  //         where: { id: createdUser.id },
  //         data: {
  //           profiles: { connect: { id: existingProfile.id } },
  //         },
  //       });
  //     } else {
  //       await prisma.profile.create({
  //         data: {
  //           username: matchedProfile.username,
  //           isPrivate: matchedProfile.isprivate,
  //           bio: matchedProfile.bio,
  //           user: { connect: { id: createdUser.id } },
  //         },
  //       });
  //     }
  //   }
  // }

  // console.log('Users and Profiles created. Moving on to Follows.');

  // // Create follows
  // for (const follow of follows) {
  //   const followerProfile = profiles.find(p => p.id === follow.followerid);
  //   const followingProfile = profiles.find(p => p.id === follow.followingid);

  //   if (followerProfile && followingProfile) {
  //     const dbFollower = await prisma.profile.findFirst({
  //       where: { username: followerProfile.username },
  //     });

  //     const dbFollowing = await prisma.profile.findFirst({
  //       where: { username: followingProfile.username },
  //     });

  //     if (dbFollower && dbFollowing) {
  //       const existingFollow = await prisma.follow.findFirst({
  //         where: {
  //           follower: { id: dbFollower.id },
  //           following: { id: dbFollowing.id },
  //         },
  //       });

  //       if (!existingFollow) {
  //         await prisma.follow.create({
  //           data: {
  //             follower: { connect: { id: dbFollower.id } },
  //             following: { connect: { id: dbFollowing.id } },
  //           },
  //         });
  //       }
  //     }
  //   }
  // }

  // console.log('Follows created. Moving on to Social Links.');

  // // Create socialLinks
  // for (const socialLink of socialLinks) {
  //   const socialProfile = profiles.find(p => p.id === socialLink.profileid);

  //   if (socialProfile) {
  //     const dbProfile = await prisma.profile.findFirst({
  //       where: { username: socialProfile.username },
  //     });

  //     if (dbProfile) {
  //       const existingSocialLink = await prisma.socialLink.findFirst({
  //         where: {
  //           platform: socialLink.platform,
  //           username: dbProfile.username,
  //           profile: {id: dbProfile.id}
  //         },
  //       });

  //       if (!existingSocialLink) {
  //         await prisma.socialLink.create({
  //           data: {
  //             platform: socialLink.platform,
  //             username: socialLink.username,
  //             profile: { connect: { id: dbProfile.id } },
  //           },
  //         });
  //       }
  //     }
  //   }
  // }

  // console.log('Social Links created. Moving on to Follow Requests.');

  // Create followRequests
  for (const followRequest of followRequests) {
    const senderProfile = profiles.find(p => p.id === followRequest.senderid);
    const receiverProfile = profiles.find(p => p.id === followRequest.receiverid);

    if (senderProfile && receiverProfile) {
      const dbSender = await prisma.profile.findFirst({
        where: { username: senderProfile.username },
      });

      const dbReceiver = await prisma.profile.findFirst({
        where: { username: receiverProfile.username },
      });

      if (dbSender && dbReceiver) {
        const existingFollowRequest = await prisma.followRequest.findFirst({
          where: {
            sender: { id: dbSender.id },
            receiver: { id: dbReceiver.id },
            requestStatus: followRequest.requeststatus,
          },
        });

        if (!existingFollowRequest) {
          await prisma.followRequest.create({
            data: {
              sender: { connect: { id: dbSender.id } },
              receiver: { connect: { id: dbReceiver.id } },
              requestStatus: followRequest.requeststatus,
            },
          });
        }
      }
    }
  }

  console.log('Follow Requests created. End of script.');
}
