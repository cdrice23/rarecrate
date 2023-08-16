import { queryType, nonNull, intArg, stringArg, nullable, extendType } from 'nexus';
import { Profile as NexusProfile, Crate as NexusCrate, FollowRequest as NexusFollowRequest } from './nexusTypes';

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
