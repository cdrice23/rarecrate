import { PrismaClient, Tag } from '@prisma/client';

const prisma = new PrismaClient();

export async function fixTagDuplicates(): Promise<void> {
  const duplicateTagCheck: { [key: string]: Tag[] } = {};
  const tags: Tag[] = await prisma.tag.findMany();

  tags.forEach(tag => {
    if (duplicateTagCheck[tag.name]) {
      duplicateTagCheck[tag.name].push(tag);
    } else {
      duplicateTagCheck[tag.name] = [tag];
    }
  });

  let duplicateTags = Object.values(duplicateTagCheck)
    .filter(tags => tags.length > 1)
    .flat();

  let uniqueTags = Object.entries(
    duplicateTags.reduce((acc, tag) => {
      acc[tag.name] = acc[tag.name] || { ...tag, duplicateIds: [] };
      if (!isSameTag(acc[tag.name], tag)) {
        acc[tag.name].duplicateIds.push(tag.id);
      }
      return acc;
    }, {}),
  ).map(([name, value]) => value);

  function isSameTag(tag1, tag2) {
    // Implement your own logic for comparing tags
    return tag1.id === tag2.id;
  }

  async function getCrateAlbumIdsByTagId(tagId) {
    const crateAlbums = await prisma.crateAlbum.findMany({
      where: {
        tags: {
          some: {
            id: tagId,
          },
        },
      },
    });
    return crateAlbums.map(crateAlbum => crateAlbum.id);
  }

  uniqueTags = await Promise.all(
    uniqueTags.map(async (tag: any) => {
      const newCrateAlbums = await getCrateAlbumIdsByTagId(tag.id);
      return { ...tag, newCrateAlbums };
    }),
  );

  type TagType = {
    id: number;
    name: string;
    duplicateIds: number[];
    newCrateAlbums: number[];
  };

  // Update all the uniqueTags and connect the dupe crateAlbums
  for (const tag of uniqueTags as TagType[]) {
    await prisma.tag.update({
      where: { id: tag.id },
      data: {
        crateAlbum: {
          connect: tag.newCrateAlbums.map(id => ({ id })),
        },
      },
    });
  }

  const duplicatesToDelete = uniqueTags.map(tag => (tag as TagType).duplicateIds).flat();

  let crateAlbumsToUpdate = [];

  for (const duplicateId of duplicatesToDelete) {
    const tagToDelete = await prisma.tag.findUnique({
      where: { id: duplicateId },
      select: {
        id: true,
        crateAlbum: true,
        name: true,
        searchAndSelectCount: true,
      },
    });

    if (tagToDelete) {
      const crateAlbumIds = tagToDelete.crateAlbum.map(album => album.id);
      crateAlbumsToUpdate.push(...crateAlbumIds);
    }
  }

  const uniqueCrateAlbumsToUpdate = [...new Set(crateAlbumsToUpdate)];

  // Disconnect the duplicate tags from each CrateAlbum that used a duplicate tag
  for (const crateAlbumId of uniqueCrateAlbumsToUpdate) {
    const crateAlbum = await prisma.crateAlbum.findUnique({
      where: { id: crateAlbumId },
      include: { tags: true },
    });

    if (crateAlbum) {
      const updatedTags = crateAlbum.tags.filter(tag => !duplicatesToDelete.includes(tag.id));

      await prisma.crateAlbum.update({
        where: { id: crateAlbumId },
        data: { tags: { set: updatedTags } },
      });
    }
  }

  // Delete the duplicate Tags
  for (const duplicateId of duplicatesToDelete) {
    await prisma.tag.delete({
      where: { id: duplicateId },
    });
  }
}
