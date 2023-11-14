import { profileSeedArray as profiles } from '../../../core/constants/seedHelpers/profile';
import { crateSeedArray as crates } from '../../../core/constants/seedHelpers/crate';
import { labelSeedArray as labels } from '../../../core/constants/seedHelpers/label';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // Create Crates
  for (let crate of crates) {
    const creatorProfile = profiles.find(p => p.id === crate.creatorid);

    if (creatorProfile) {
      const dbProfile = await prisma.profile.findFirst({
        where: { username: creatorProfile.username },
      });

      if (dbProfile) {
        const existingCrate = await prisma.crate.findFirst({
          where: {
            title: crate.title,
            description: crate.description,
            creator: { id: dbProfile.id },
            isRanked: crate.isranked,
          },
        });

        let dbFavorited = [];
        if (crate.favoritedby) {
          const favoritedUsernames = crate.favoritedby
            .split(',')
            .map(profileId => profiles.find(p => p.id === profileId)?.username);
          dbFavorited = await prisma.profile
            .findMany({
              where: { username: { in: favoritedUsernames } },
              select: { id: true },
            })
            .then((profiles: any) => profiles.map((profile: any) => profile.id));
        }

        if (!existingCrate) {
          await prisma.crate.create({
            data: {
              title: crate.title,
              description: crate.description,
              creator: { connect: { id: dbProfile.id } },
              isRanked: crate.isranked,
              favoritedBy: crate.favoritedby
                ? { connect: dbFavorited.map((profileId: any) => ({ id: profileId })) }
                : undefined,
            },
          });
        }
      }
    }
  }

  console.log('Crates created and linked to Profiles. Moving on to Labels.');
  // Create labels
  for (let label of labels) {
    const existingLabel = await prisma.label.findFirst({
      where: {
        name: label.name,
        isStandard: label.isstandard,
      },
    });

    let dbCrates = [];
    if (label.crates) {
      const crateNames = label.crates.split(',').map(crateId => crates.find(p => p.id === crateId)?.title);
      dbCrates = await prisma.crate
        .findMany({
          where: { title: { in: crateNames } },
          select: { id: true },
        })
        .then((crates: any) => crates.map((crate: any) => crate.id));
    }

    if (!existingLabel) {
      await prisma.label.create({
        data: {
          name: label.name,
          isStandard: label.isstandard,
          crates: label.crates ? { connect: dbCrates.map((crateId: any) => ({ id: crateId })) } : undefined,
        },
      });
    }
  }

  console.log('Labels created. End of script.');
}
