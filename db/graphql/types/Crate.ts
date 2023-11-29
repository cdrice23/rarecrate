import { objectType, inputObjectType, nonNull, intArg, stringArg, extendType, booleanArg } from 'nexus';
import { Crate as PrismaCrate, Label as PrismaLabel } from 'nexus-prisma';
import { CrateAlbum, CrateAlbumInput } from './Album';
import { Profile } from './Profile';
import { Recommendation } from './Recommendation';

export const Crate = objectType({
  name: PrismaCrate.$name,
  definition(t) {
    t.field(PrismaCrate.id.name, {
      type: PrismaCrate.id.type,
    });
    t.field(PrismaCrate.title.name, {
      type: PrismaCrate.title.type,
    });
    t.field(PrismaCrate.description.name, {
      type: PrismaCrate.description.type,
    });
    t.field(PrismaCrate.creator.name, {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .creator({
            select: {
              id: true,
              username: true,
              image: true,
              isPrivate: true,
            },
          });
      },
    });
    t.field(PrismaCrate.creatorId.name, {
      type: PrismaCrate.creatorId.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
    });
    t.field(PrismaCrate.isRanked.name, {
      type: PrismaCrate.isRanked.type,
    });
    t.field(PrismaCrate.searchAndSelectCount.name, {
      type: PrismaCrate.searchAndSelectCount.type,
    });
    t.list.field('favoritedBy', {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .favoritedBy({
            select: {
              id: true,
              image: true,
              username: true,
            },
          });
      },
    });
    t.list.field('labels', {
      type: Label,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .labels();
      },
    });
    t.list.field('albums', {
      type: CrateAlbum,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .albums();
      },
    });
    t.list.field('recommendedIn', {
      type: Recommendation,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .recommendedIn();
      },
    });
  },
});

export const Label = objectType({
  name: PrismaLabel.$name,
  definition(t) {
    t.field(PrismaLabel.id.name, {
      type: PrismaLabel.id.type,
    });
    t.field(PrismaLabel.name.name, {
      type: PrismaLabel.name.type,
    });
    t.field(PrismaLabel.isStandard.name, {
      type: PrismaLabel.isStandard.type,
    });
    t.list.field(PrismaLabel.crates.name, {
      type: Crate,
    });
    t.field(PrismaLabel.searchAndSelectCount.name, {
      type: PrismaLabel.searchAndSelectCount.type,
    });
  },
});

export const CrateProfileInput = inputObjectType({
  name: 'CrateProfileInput',
  definition(t) {
    t.nonNull.int('crateId');
    t.nonNull.int('profileId');
  },
});

export const CrateInput = inputObjectType({
  name: 'CrateInput',
  definition(t) {
    t.int('id');
    t.nonNull.string('title');
    t.nonNull.string('description');
    t.nonNull.int('creatorId');
    t.nonNull.boolean('isRanked');
    t.list.int('labelIds');
    t.nonNull.list.field('crateAlbums', { type: CrateAlbumInput });
  },
});

export const CrateMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addCrateToFavorites', {
      type: Crate,
      args: {
        input: nonNull(CrateProfileInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { crateId, profileId } = input;
        const crate = await ctx.prisma.crate.update({
          where: {
            id: crateId,
          },
          data: {
            favoritedBy: {
              connect: { id: profileId },
            },
          },
          include: {
            creator: true,
          },
        });

        return crate;
      },
    });

    t.field('removeCrateFromFavorites', {
      type: Crate,
      args: {
        input: nonNull(CrateProfileInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { crateId, profileId } = input;
        const crate = await ctx.prisma.crate.update({
          where: {
            id: crateId,
          },
          data: {
            favoritedBy: {
              disconnect: { id: profileId },
            },
          },
        });

        return crate;
      },
    });

    t.field('addNewCrate', {
      type: Crate,
      args: {
        input: nonNull(CrateInput),
      },
      resolve: async (_, { input: { title, description, creatorId, isRanked, labelIds, crateAlbums } }, ctx) => {
        return ctx.prisma.crate.create({
          data: {
            title,
            description,
            isRanked,
            creator: {
              connect: { id: creatorId },
            },
            labels: {
              connect: labelIds.map(labelId => ({ id: labelId })),
            },
            albums: {
              create: crateAlbums.map(({ albumId, tagIds, order }) => ({
                album: {
                  connect: { id: albumId },
                },
                tags: {
                  connect: tagIds.map(tagId => ({ id: tagId })),
                },
                rank: order,
              })),
            },
          },
        });
      },
    });

    t.field('updateCrate', {
      type: Crate,
      args: {
        input: nonNull(CrateInput),
      },
      resolve: async (_, { input: { id, title, description, isRanked, labelIds, crateAlbums } }, ctx) => {
        // Find existing labels on Crate
        const existingLabels = await ctx.prisma.crate.findMany({
          where: { id: id },
          include: { labels: true },
        });

        // Map existing labelIds
        const existingLabelIds = existingLabels[0].labels.map(label => label.id);

        // Identify labels to disconnect
        const labelsToDisconnect = existingLabelIds.filter(existingLabelId => !labelIds.includes(existingLabelId));

        // Identify new labels to connect
        const newLabelIds = labelIds.filter(labelId => !existingLabelIds.includes(labelId));

        // Get all existing crateAlbums
        const existingCrateAlbums = await ctx.prisma.crateAlbum.findMany({
          where: { crateId: id },
          include: { album: true, tags: true },
        });

        // Identify crateAlbums to create
        const newCrateAlbums = crateAlbums.filter(
          crateAlbum => !existingCrateAlbums.map(existing => existing.album.id).includes(crateAlbum.albumId),
        );

        // Identify crateAlbums to disconnect
        const crateAlbumsToDisconnect = existingCrateAlbums.filter(
          crateAlbum => !crateAlbums.some(inputCrateAlbum => inputCrateAlbum.albumId === crateAlbum.album.id),
        );

        // Identify crateAlbums to update
        const existingCrateAlbumsToUpdate = existingCrateAlbums.filter(existingCrateAlbum =>
          crateAlbums.some(crateAlbum => crateAlbum.albumId === existingCrateAlbum.album.id),
        );

        // Create new crateAlbums
        let newlyCreatedCrateAlbums = [];
        for (const newCrateAlbum of newCrateAlbums) {
          const createdCrateAlbum = await ctx.prisma.crateAlbum.create({
            data: {
              crate: {
                connect: { id: id },
              },
              album: {
                connect: { id: newCrateAlbum.albumId },
              },
              tags: {
                connect: newCrateAlbum.tagIds.map(tagId => ({ id: tagId })),
              },
              rank: newCrateAlbum.order,
            },
          });
          newlyCreatedCrateAlbums.push(createdCrateAlbum);
        }

        // Disconnect crateAlbums
        for (const crateAlbumToDisconnect of crateAlbumsToDisconnect) {
          await ctx.prisma.crateAlbum.delete({
            where: { id: crateAlbumToDisconnect.id },
          });
        }

        // Update crateAlbums
        for (const existingCrateAlbumToUpdate of existingCrateAlbumsToUpdate) {
          const existingTags = existingCrateAlbumToUpdate.tags.flatMap(tag => tag.id);
          const tagsToConnect = crateAlbums
            .find(album => album.albumId === existingCrateAlbumToUpdate.album.id)
            .tagIds.filter(tagId => !existingTags.includes(tagId));
          const tagsToDisconnect = existingTags.filter(
            tagId =>
              !crateAlbums.find(album => album.albumId === existingCrateAlbumToUpdate.album.id).tagIds.includes(tagId),
          );

          await ctx.prisma.crateAlbum.update({
            where: { id: existingCrateAlbumToUpdate.id },
            data: {
              tags: {
                connect: tagsToConnect.map(tag => ({ id: tag })),
                disconnect: tagsToDisconnect.map(tag => ({ id: tag })),
              },
              rank: crateAlbums.find(album => album.albumId === existingCrateAlbumToUpdate.album.id).order,
            },
          });
        }

        //update crate
        return ctx.prisma.crate.update({
          where: { id },
          data: {
            title,
            description,
            isRanked,
            labels: {
              connect: newLabelIds.map(labelId => ({ id: labelId })),
              disconnect: labelsToDisconnect.map(labelId => ({ id: labelId })),
            },
          },
        });
      },
    });
  },
});

export const LabelMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addNewLabel', {
      type: Label,
      args: {
        name: nonNull(stringArg()),
      },
      resolve: async (_, { name }, ctx) => {
        const existingLabel = await ctx.prisma.label.findUnique({
          where: {
            name,
          },
        });

        if (existingLabel) {
          return existingLabel;
        } else {
          const newLabel = await ctx.prisma.label.create({
            data: {
              name,
              isStandard: false,
            },
          });

          return newLabel;
        }
      },
    });
  },
});

export const CrateQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getCrateDetailWithAlbums', {
      type: Crate,
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        const crate = await ctx.prisma.crate.findUnique({
          where: { id },
        });

        const crateAlbums = await ctx.prisma.crateAlbum.findMany({
          where: {
            crateId: crate.id,
          },
        });

        return {
          ...crate,
          ...crateAlbums,
        };
      },
    });

    t.nonNull.list.field('qsCrates', {
      type: Crate,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.crate.findMany({
          where: {
            title: {
              contains: searchTerm,
            },
          },
          include: {
            creator: true,
          },
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: 9,
        });
      },
    });

    t.nonNull.list.field('fsCrates', {
      type: Crate,
      args: {
        searchTerm: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const crates = await ctx.prisma.crate.findMany({
          where: {
            title: {
              contains: searchTerm,
            },
          },
          include: {
            creator: true,
          },
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getCratesFromLabel', {
      type: Crate,
      args: {
        labelId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { labelId, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const crates = await ctx.prisma.crate.findMany({
          where: {
            labels: {
              some: {
                id: labelId,
              },
            },
          },
          include: {
            creator: true,
          },
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getCratesFromAlbum', {
      type: Crate,
      args: {
        albumId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { albumId, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const crates = await ctx.prisma.crate.findMany({
          where: {
            albums: {
              some: {
                album: {
                  id: albumId,
                },
              },
            },
          },
          include: {
            creator: true,
          },
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getProfileCrates', {
      type: Crate,
      args: {
        username: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { username, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const crates = await ctx.prisma.crate.findMany({
          where: {
            creator: {
              username: username,
            },
          },
          include: {
            creator: true,
          },
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getProfileFavorites', {
      type: Crate,
      args: {
        username: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { username, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const favorites = await ctx.prisma.crate.findMany({
          where: {
            favoritedBy: {
              some: {
                username: username,
              },
            },
          },
          include: {
            creator: true,
          },
          skip: skip,
          take: 30,
        });

        return favorites;
      },
    });
  },
});

export const LabelQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchLabelsByName', {
      type: Label,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.label.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          orderBy: [
            {
              _relevance: {
                fields: ['name'],
                search: searchTerm,
                sort: 'desc',
              },
            },
          ],
        });
      },
    });

    t.nonNull.field('searchLabelsById', {
      type: Label,
      args: {
        labelId: nonNull(intArg()),
      },
      resolve: async (_, { labelId }, ctx) => {
        return await ctx.prisma.label.findUnique({
          where: {
            id: labelId,
          },
        });
      },
    });

    t.list.field('getTopLabels', {
      type: Label,
      args: {
        quantity: intArg(),
        includeStandard: booleanArg(),
      },
      resolve: async (_, { quantity = 20, includeStandard = false }, ctx) => {
        return await ctx.prisma.label.findMany({
          where: {
            isStandard: includeStandard ? undefined : false,
          },
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: quantity,
        });
      },
    });

    t.nonNull.list.field('qsLabels', {
      type: Label,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.label.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: 9,
        });
      },
    });

    t.nonNull.list.field('fsLabels', {
      type: Label,
      args: {
        searchTerm: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const labels = await ctx.prisma.label.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          skip: skip,
          take: 30,
        });

        return labels;
      },
    });
  },
});
