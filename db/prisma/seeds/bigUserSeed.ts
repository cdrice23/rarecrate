import { userSeedArray as users } from '@/core/constants/seedHelpers/user';
import { profileSeedArray as profiles } from '@/core/constants/seedHelpers/profile';
import { followSeedArray as follows } from '@/core/constants/seedHelpers/follow';
import { followRequestSeedArray as followRequests } from '@/core/constants/seedHelpers/followRequest';
import { socialLinkSeedArray as socialLinks } from '@/core/constants/seedHelpers/socialLink';
import { crateSeedArray as crates } from '@/core/constants/seedHelpers/crate';
import { labelSeedArray as labels } from '@/core/constants/seedHelpers/label';
import { crateAlbumSeedArray as crateAlbums } from '@/core/constants/seedHelpers/crateAlbum';
import { tagSeedArray as tags } from '@/core/constants/seedHelpers/tag';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // for (let user of users) {
  //   await prisma.user.connectOrCreate({
  //     where: {},
  //     create: {
  //       profiles: {
  //         connectOrCreate: user.profiles.map(profile => ({
  //           where: { userId: profile.userId },
  //           create: {
  //             ...profile,
  //             follows: {
  //               connectOrCreate: profile.follows.map(follow => ({
  //                 where: { id: follow.id },
  //                 create: follow,
  //               })),
  //             },
  //           },
  //         })),
  //       },
  //     },
  //   });
  // }
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
