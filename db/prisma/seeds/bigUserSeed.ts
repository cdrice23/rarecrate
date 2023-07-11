import { userSeedArray as users } from '../../../core/constants/seedHelpers/user';
import { profileSeedArray as profiles } from '../../../core/constants/seedHelpers/profile';
import { followSeedArray as follows } from '@/core/constants/seedHelpers/follow';
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
}
