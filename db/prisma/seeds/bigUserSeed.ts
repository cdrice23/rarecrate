import { userSeedArray as users } from '../../../core/constants/seedHelpers/user';
import { profileSeedArray as profiles } from '../../../core/constants/seedHelpers/profile';
import { followSeedArray as follows } from '../../../core/constants/seedHelpers/follow';
import { followRequestSeedArray as followRequests } from '@/core/constants/seedHelpers/followRequest';
import { socialLinkSeedArray as socialLinks } from '@/core/constants/seedHelpers/socialLink';
import { crateSeedArray as crates } from '@/core/constants/seedHelpers/crate';
import { labelSeedArray as labels } from '@/core/constants/seedHelpers/label';
import { crateAlbumSeedArray as crateAlbums } from '@/core/constants/seedHelpers/crateAlbum';
import { tagSeedArray as tags } from '@/core/constants/seedHelpers/tag';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// // OG script to test users
// export async function main() {
//   // Iterate over the userSeedArray
//   for (let user of users) {
//     // Create the user in the database
//     const createdUser = await prisma.user.create({
//       data: {
//         email: user.email,
//         emailVerified: user.emailverified,
//         role: user.role,
//       },
//     });

//     // Find the corresponding profile in the profileSeedArray
//     const matchedProfile = profiles.find(p => p.userid === user.id);

//     if (matchedProfile) {
//       // Check if a matching profile exists in the database based on certain fields
//       const existingProfile = await prisma.profile.findFirst({
//         where: {
//           username: matchedProfile.username,
//           isPrivate: matchedProfile.isprivate,
//           bio: matchedProfile.bio,
//         },
//       });

//       if (existingProfile) {
//         // Connect the existing profile to the user
//         await prisma.user.update({
//           where: { id: createdUser.id },
//           data: {
//             profiles: { connect: { id: existingProfile.id } },
//           },
//         });
//       } else {
//         // Create a new Profile associated with the User in the database with auto-generated id
//         await prisma.profile.create({
//           data: {
//             username: matchedProfile.username,
//             isPrivate: matchedProfile.isprivate,
//             bio: matchedProfile.bio,
//             user: { connect: { id: createdUser.id } },
//           },
//         });
//       }
//     }
//   }
// }

// Write a function to find the created X in the array Y to access all the extra props
// Find all the related items you need
// Create and connect

export async function main() {
  // Iterate over the userSeedArray
  for (let user of users) {
    // Create the user in the database
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        emailVerified: user.emailverified,
        role: user.role,
      },
    });

    // Find the corresponding profile in the profileSeedArray
    const matchedProfile = profiles.find(p => p.userid === user.id);

    if (matchedProfile) {
      // Check if a matching profile exists in the database based on certain fields
      const existingProfile = await prisma.profile.findFirst({
        where: {
          username: matchedProfile.username,
          isPrivate: matchedProfile.isprivate,
          bio: matchedProfile.bio,
        },
      });

      // Find the corresponding follows, socialLinks, and followRequests

      if (existingProfile) {
        // Connect the existing profile to the user
        await prisma.user.update({
          where: { id: createdUser.id },
          data: {
            profiles: { connect: { id: existingProfile.id } },
          },
        });
      } else {
        // Create a new Profile associated with the User in the database with auto-generated id
        await prisma.profile.create({
          data: {
            username: matchedProfile.username,
            isPrivate: matchedProfile.isprivate,
            bio: matchedProfile.bio,
            user: { connect: { id: createdUser.id } },
          },
        });
      }
    }
  }

  console.log('Users and Profiles created. Moving on to Follows.');

  // Get all profiles from the database
  const dbProfiles = await prisma.profile.findMany();

  // Iterate over the profiles
  for (const profile of dbProfiles) {
    // Find the corresponding generated profile in the profileSeedArray
    const generatedProfile = profiles.find((p: any) => p.username === profile.username);

    if (generatedProfile) {
      // Parse the generated profile's follower and following props using split to create a giant array of followIds
      const followerIds = generatedProfile.followers.split(',');
      const followingIds = generatedProfile.following.split(',');
      const followIds = [...followerIds, ...followingIds];

      // Iterate over the followIds array
      for (const followId of followIds) {
        // Find the corresponding follow in the followSeedArray
        const follow = follows.find((f: any) => f.id === followId);

        if (follow) {
          // Find the corresponding follower and following Profile records in the database
          const follower = profiles.find((p: any) => p.id === follow.followerid);
          const following = profiles.find((p: any) => p.id === follow.followingid);

          if (follower && following) {
            // Find the corresponding dbFollower and dbFollowing ids by cross-referencing with dbProfiles
            const dbFollower = dbProfiles.find((p: any) => p.username === follower.username);
            const dbFollowing = dbProfiles.find((p: any) => p.username === following.username);
            // Check if a follow with the same follower and following already exists in the database
            const existingFollow = await prisma.follow.findFirst({
              where: {
                follower: { id: dbFollower.id },
                following: { id: dbFollowing.id },
              },
            });

            if (!existingFollow) {
              // Create a new Follow and connect it to the profile - all follows are unique combos
              await prisma.follow.create({
                data: {
                  follower: { connect: { id: dbFollower.id } },
                  following: { connect: { id: dbFollowing.id } },
                },
              });
            }
          }
        }
      }
    }
  }
}
