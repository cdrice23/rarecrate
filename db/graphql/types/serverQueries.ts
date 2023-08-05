import { queryType, nonNull, intArg, stringArg } from 'nexus';
import { Profile as NexusProfile } from './nexusTypes';

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
    t.nonNull.field('getProfileByUsername', {
      type: NexusProfile,
      args: {
        username: nonNull(stringArg()),
      },
      resolve: async (_, { username }, ctx) => {
        return await ctx.prisma.profile.findUnique({
          where: { username: username },
          select: {
            id: true,
            username: true,
            isPrivate: true,
            bio: true,
            image: true,
          },
        });
      },
    });
  },
});
