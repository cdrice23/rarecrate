import { queryType, nonNull, intArg, stringArg, nullable, extendType, list } from 'nexus';
import { Profile as NexusProfile, Crate as NexusCrate, CrateAlbum as NexusCrateAlbum } from './nexusTypes';

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

// export const CrateQueries = extendType({
//   type: 'Query',
//   definition(t) {
//     t.nonNull.field('getCrate', {
//       type: NexusCrate,
//       args: {
//         id: nonNull(intArg()),
//       },
//       resolve: async (_, { id }, ctx) => {
//         return await ctx.prisma.crate.findUnique({
//           where: { id },
//         });
//       },
//     });
//   },
// });

// export const CrateAlbumQueries = extendType({
//   type: 'Query',
//   definition(t) {
//     t.list.field('getCrateAlbums', {
//       type: NexusCrateAlbum,
//       args: {
//         ids: nonNull(list(intArg())),
//       },
//       resolve: async (_, { ids }, ctx) => {
//         return await ctx.prisma.crateAlbum.findMany({
//           where: {
//             id: {
//               in: ids,
//             },
//           },
//           include: {
//             crate: true,
//             album: {
//               select: {
//                 genres: true,
//                 subgenres: true,
//                 tracklist: true,
//                 id: true,
//                 title: true,
//                 artist: true,
//                 label: true,
//                 releaseYear: true,
//                 imageUrl: true,
//               },
//             },
//             tags: true,
//           },
//         });
//       },
//     });
//   },
// });

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
