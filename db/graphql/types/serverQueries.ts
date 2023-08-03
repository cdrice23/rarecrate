import { queryType, nonNull, intArg } from 'nexus';
import { Profile as NexusProfile } from './nexusTypes';

export const ProfileQueries = queryType({
  definition(t) {
    t.nonNull.list.nonNull.field('getProfileById', {
      type: NexusProfile,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        return await ctx.prisma.profile.findMany({
          where: { userId: userId },
        });
      },
    });
  },
});

// export const ProfileQueries = queryType({
//   definition(t) {
//     t.field('getProfileById', {
//       type: 'NProfile',
//       args: {
//         userId: nonNull(intArg()),
//       },
//       resolve: async (_, { userId }, ctx) => {
//         const profile = await ctx.db.profile.findUnique({
//           where: { userId: userId },
//           include: {
//             user: true,
//             followers: true,
//             following: true,
//             crates: true,
//             favorites: true,
//             socialLinks: true,
//             followRequestsSent: true,
//             followRequestsReceived: true,
//             recommendations: true,
//           },
//         });

//         return profile;
//       },
//     });
//   },
// });

// export const HelloWorldQueries = extendType({
//   type: 'Query',
//   definition(t) {
//     t.field('helloWorld', {
//       type: 'String',
//       resolve: () => {
//         return 'Hello World';
//       },
//     });
//   },
// });
