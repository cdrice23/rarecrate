import { queryType, nonNull, intArg, stringArg, nullable, extendType, booleanArg } from 'nexus';
import {
  Profile as NexusProfile,
  Crate as NexusCrate,
  FollowRequest as NexusFollowRequest,
  Label as NexusLabel,
  Tag as NexusTag,
  Album as NexusAlbum,
} from './nexusTypes';

// GET QUERIES
export const ProfileQueries = queryType({
  definition(t) {
    t.nonNull.list.nonNull.field('getUsernameById', {
      type: NexusProfile,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        return await ctx.prisma.profile.findMany({
          where: { userId },
          select: {
            id: true,
            username: true,
          },
        });
      },
    });
    t.nonNull.field('getProfile', {
      type: NexusProfile,
      args: {
        id: nullable(intArg()),
        username: nullable(stringArg()),
      },
      resolve: async (_, { id, username }, ctx) => {
        const where = id ? { id } : { username };
        return await ctx.prisma.profile.findUnique({
          where,
        });
      },
    });
  },
});

export const CrateQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getCrateDetailWithAlbums', {
      type: NexusCrate,
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
  },
});

export const FollowRequestQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('getPendingFollowRequests', {
      type: NexusFollowRequest,
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, ctx) => {
        return await ctx.prisma.followRequest.findMany({
          where: { receiverId: id, requestStatus: 'PENDING' },
          select: {
            id: true,
            sender: true,
            receiver: true,
          },
        });
      },
    });
  },
});

export const LabelQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchLabels', {
      type: NexusLabel,
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

    t.list.field('getTopLabels', {
      type: NexusLabel,
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
  },
});

export const TagQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchTags', {
      type: NexusTag,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.tag.findMany({
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

    t.list.field('getTopTags', {
      type: NexusTag,
      args: {
        quantity: intArg(),
      },
      resolve: async (_, { quantity = 20 }, ctx) => {
        return await ctx.prisma.label.findMany({
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: quantity,
        });
      },
    });
  },
});

export const AlbumQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchPrismaAlbums', {
      type: NexusAlbum,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        // OG search algo
        const titleResults = await ctx.prisma.album.findMany({
          where: {
            title: {
              contains: searchTerm,
            },
          },
          orderBy: {
            _relevance: {
              fields: ['title'],
              search: searchTerm,
              sort: 'desc',
            },
          },
        });

        const artistResults = await ctx.prisma.album.findMany({
          where: {
            artist: {
              contains: searchTerm,
            },
          },
          orderBy: {
            _relevance: {
              fields: ['artist'],
              search: searchTerm,
              sort: 'desc',
            },
          },
        });

        const combinedResults = [...titleResults, ...artistResults];

        return combinedResults.sort((a, b) => b._relevance - a._relevance);
        // const exactMatches = await ctx.prisma.album.findMany({
        //   where: {
        //     OR: [
        //       { title: { contains: searchTerm } },
        //       { artist: { contains: searchTerm } },
        //     ],
        //   },
        // });

        // const sortedMatches = exactMatches.sort((a, b) => {
        //   const aTitleLengthDiff = Math.abs(a.title.length - searchTerm.length);
        //   const bTitleLengthDiff = Math.abs(b.title.length - searchTerm.length);
        //   const aArtistLengthDiff = Math.abs(a.artist.length - searchTerm.length);
        //   const bArtistLengthDiff = Math.abs(b.artist.length - searchTerm.length);

        //   if (aTitleLengthDiff === bTitleLengthDiff) {
        //     return aArtistLengthDiff - bArtistLengthDiff;
        //   }

        //   return aTitleLengthDiff - bTitleLengthDiff;
        // });

        // return sortedMatches;
      },
    });
  },
});
