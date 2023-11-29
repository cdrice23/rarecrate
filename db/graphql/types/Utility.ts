import { objectType, nonNull, intArg, stringArg, extendType } from 'nexus';
import {
  CronJob as PrismaCronJob,
  CronRun as PrismaCronRun,
  SelectedSearchResult as PrismaSelectedSearchResult,
} from 'nexus-prisma';

export const CronJob = objectType({
  name: PrismaCronJob.$name,
  definition(t) {
    t.field(PrismaCronJob.id.name, {
      type: PrismaCronJob.id.type,
    });
    t.field(PrismaCronJob.scriptName.name, {
      type: PrismaCronJob.scriptName.type,
    });
    t.field(PrismaCronJob.path.name, {
      type: PrismaCronJob.path.type,
    });
    t.list.field(PrismaCronJob.runs.name, {
      type: CronRun,
    });
  },
});

export const CronRun = objectType({
  name: PrismaCronRun.$name,
  definition(t) {
    t.field(PrismaCronRun.id.name, {
      type: PrismaCronRun.id.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('completedAt', {
      type: 'DateTime',
    });
    t.field(PrismaCronRun.lastProcessedItem.name, {
      type: PrismaCronRun.lastProcessedItem.type,
    });
    t.field(PrismaCronRun.cronJob.name, {
      type: CronJob,
    });
    t.field(PrismaCronRun.cronJobId.name, {
      type: PrismaCronRun.cronJobId.type,
    });
  },
});

export const SelectedSearchResult = objectType({
  name: PrismaSelectedSearchResult.$name,
  definition(t) {
    t.field(PrismaSelectedSearchResult.id.name, {
      type: PrismaSelectedSearchResult.id.type,
    });
    t.field(PrismaSelectedSearchResult.searchTerm.name, {
      type: PrismaSelectedSearchResult.searchTerm.type,
    });
    t.field(PrismaSelectedSearchResult.searchResult.name, {
      type: PrismaSelectedSearchResult.searchResult.type,
    });
    t.field(PrismaSelectedSearchResult.resultType.name, {
      type: PrismaSelectedSearchResult.resultType.type,
    });
    t.field(PrismaSelectedSearchResult.selectedId.name, {
      type: PrismaSelectedSearchResult.selectedId.type,
    });
  },
});

export const SelectedSearchResultMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.list.field('logSelectedSearchResult', {
      type: SelectedSearchResult,
      args: {
        searchTerm: stringArg(),
        prismaModel: nonNull(stringArg()),
        selectedId: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, prismaModel, selectedId }, ctx) => {
        let searchResult;

        switch (prismaModel) {
          case 'profile':
            const matchingProfile = await ctx.prisma.profile.findUnique({
              where: { id: selectedId },
              select: { username: true, searchAndSelectCount: true },
            });

            await ctx.prisma.profile.update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingProfile.searchAndSelectCount + 1 },
            });

            searchResult = matchingProfile.username;
            break;
          case 'crate':
          case 'album':
            const matchingTitleResult = await ctx.prisma[prismaModel].findUnique({
              where: { id: selectedId },
              select: { title: true, searchAndSelectCount: true },
            });

            await ctx.prisma[prismaModel].update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingTitleResult.searchAndSelectCount + 1 },
            });

            searchResult = matchingTitleResult.title;
            break;
          case 'label':
          case 'tag':
          case 'genre':
          case 'subgenre':
            const matchingNameResult = await ctx.prisma[prismaModel].findUnique({
              where: { id: selectedId },
              select: { name: true, searchAndSelectCount: true },
            });

            await ctx.prisma[prismaModel].update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingNameResult.searchAndSelectCount + 1 },
            });

            searchResult = matchingNameResult.name;
            break;
          default:
            throw new Error('Invalid prismaModel');
        }

        const createdSelectedSearchResult = await ctx.prisma.selectedSearchResult.create({
          data: {
            ...(searchTerm && { searchTerm }),
            resultType: prismaModel,
            searchResult,
            selectedId,
          },
        });

        // NOTE - Artist solution causing too many writes, so freezing this for now
        // If prismaModel is 'album', create another SelectedSearchResult for title
        // let albumTitleSelectedSearchResult;
        // if (prismaModel === 'album') {
        //   const matchingArtistResult = await ctx.prisma.album.findUnique({
        //     where: { id: selectedId },
        //     select: { artist: true },
        //   });

        //   albumTitleSelectedSearchResult = await ctx.prisma.selectedSearchResult.create({
        //     data: {
        //       ...(searchTerm && { searchTerm }),
        //       resultType: 'album',
        //       searchResult: matchingArtistResult.artist,
        //       selectedId,
        //     },
        //   });

        //   // NOTE: this is an interim solution before the Quick Results searchTerm implementation - i.e. assuming that selecting an album increases the entire artist's searchAndSelect ranking
        //   const artistAlbums = await ctx.prisma.album.findMany({
        //     where: { artist: matchingArtistResult.artist, NOT: { id: selectedId } },
        //     select: { id: true, searchAndSelectCount: true },
        //   });

        //   for (const album of artistAlbums) {
        //     await ctx.prisma.album.update({
        //       where: { id: album.id },
        //       data: { searchAndSelectCount: album.searchAndSelectCount + 1 },
        //     });
        //   }
        // }

        // return [createdSelectedSearchResult, albumTitleSelectedSearchResult];
        return [createdSelectedSearchResult];
      },
    });
  },
});
