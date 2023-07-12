import { profileSeedArray as profiles } from '../../../core/constants/seedHelpers/profile';
import { crateSeedArray as crates } from '../../../core/constants/seedHelpers/crate';
import { labelSeedArray as labels } from '../../../core/constants/seedHelpers/label';
import { crateAlbumSeedArray as crateAlbums } from '../../../core/constants/seedHelpers/crateAlbum';
import { tagSeedArray as tags } from '../../../core/constants/seedHelpers/tag';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // // Create Crates
  // for (let crate of crates) {
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
  // console.log('Crates created and linked to Profiles. Moving on to Labels.');
  // // Create labels
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
  // console.log('Labels created. End of script.');
}
