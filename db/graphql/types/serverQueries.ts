import { queryType, nonNull, intArg } from 'nexus';
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
          where: { userId: userId },
          select: {
            id: true,
            username: true,
          },
        });
      },
    });
  },
});
