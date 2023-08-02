import { queryType, intArg, nonNull } from 'nexus';

export const ProfileQueries = queryType({
  definition(t) {
    t.field('getProfileById', {
      type: 'Profile',
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        console.log('Hello');
        const profile = await ctx.db.profile.findUnique({
          where: { userId: userId },
          include: {
            user: true,
            followers: true,
            following: true,
            crates: true,
            favorites: true,
            socialLinks: true,
            followRequestsSent: true,
            followRequestsReceived: true,
            recommendations: true,
          },
        });

        return profile;
      },
    });
  },
});
