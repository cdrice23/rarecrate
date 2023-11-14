import { crateSeedArray as crates } from '@/core/constants/seedHelpers/crate';
import { crateAlbumSeedArray as crateAlbums } from '@/core/constants/seedHelpers/crateAlbum';
import { tagSeedArray as tags } from '@/core/constants/seedHelpers/tag';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function main() {
  // Create Crate Albums
  for (let crateAlbum of crateAlbums) {
    // Find the associated crate
    const parentCrate = crates.find(c => c.id === crateAlbum.crateid);

    if (parentCrate) {
      // Find the crate Id
      const dbCrate = await prisma.crate.findFirst({
        where: {
          title: parentCrate.title,
          description: parentCrate.description,
        },
      });

      if (dbCrate) {
        // Retrieve album IDs connected to crateAlbums associated with the same crate
        const connectedAlbumIds = await prisma.crateAlbum.findMany({
          where: {
            crate: { id: dbCrate.id },
          },
          select: {
            album: { select: { id: true } },
          },
        });

        let randomAlbumId: any;
        let uniqueAlbumFound = false;
        const dbAlbums = await prisma.album.findMany();

        while (!uniqueAlbumFound) {
          // Generate a random index to select an album
          const randomIndex = Math.floor(Math.random() * dbAlbums.length);
          randomAlbumId = dbAlbums[randomIndex].id;

          // Check if the randomly selected album ID is already connected to any crateAlbum associated with the same crate
          const isAlbumConnected = connectedAlbumIds.some(
            (connectedAlbum: any) => connectedAlbum.album.id === randomAlbumId,
          );

          if (!isAlbumConnected) {
            uniqueAlbumFound = true;
          }
        }

        await prisma.crateAlbum.create({
          data: {
            crate: { connect: { id: dbCrate.id } },
            rank: crateAlbum.rank || undefined,
            album: { connect: { id: randomAlbumId } },
          },
        });
      }
    }
  }

  console.log('Crates Albums created and linked to Crates and Albums. Moving on to Tags.');
  // Create Tags
  const createdTags = [];
  for (let tag of tags) {
    const createdTag = await prisma.tag.create({ data: { name: tag.name } });
    createdTags.push(createdTag);
  }

  // Connect Tags to Crate Albums
  const dbCrateAlbums = await prisma.crateAlbum.findMany();
  for (const crateAlbum of dbCrateAlbums) {
    const randomTags = getRandomTags(createdTags);
    for (const tag of randomTags) {
      await prisma.tag.update({
        where: { id: tag.id },
        data: { crateAlbum: { connect: { id: crateAlbum.id } } },
      });
    }
  }
  console.log('Tags created. End of script.');
}

function getRandomTags(tags: any) {
  const randomCount = Math.floor(Math.random() * 5) + 1;
  const shuffledTags = tags.sort(() => 0.5 - Math.random());
  return shuffledTags.slice(0, randomCount);
}
