import { objectType, nonNull, intArg, extendType, list } from 'nexus';
import { Recommendation as PrismaRecommendation } from 'nexus-prisma';
import { Profile } from './Profile';
import { Crate } from './Crate';

export const Recommendation = objectType({
  name: PrismaRecommendation.$name,
  definition(t) {
    t.field(PrismaRecommendation.id.name, {
      type: PrismaRecommendation.id.type,
    });
    t.field(PrismaRecommendation.profile.name, {
      type: Profile,
    });
    t.field(PrismaRecommendation.profileId.name, {
      type: PrismaRecommendation.profileId.type,
    });
    t.field(PrismaRecommendation.crate.name, {
      type: Crate,
    });
    t.field(PrismaRecommendation.crateId.name, {
      type: PrismaRecommendation.crateId.type,
    });
    t.field(PrismaRecommendation.seen.name, {
      type: PrismaRecommendation.seen.type,
    });
    t.field(PrismaRecommendation.recommendationType.name, {
      type: PrismaRecommendation.recommendationType.type,
    });
  },
});

export const RecommendationResults = objectType({
  name: 'RecommendationResults',
  definition(t) {
    t.list.field('recommendations', {
      type: Recommendation,
    });
    t.list.field('usedPages', {
      type: 'Int',
    });
    t.field('currentRecsInArray', {
      type: 'Int',
    });
    t.field('resetRecommendations', {
      type: 'Boolean',
    });
  },
});

export const RecommendationMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('markRecommendationSeen', {
      type: Recommendation,
      args: {
        recommendationId: nonNull(intArg()),
      },
      resolve: async (_, { recommendationId }, ctx) => {
        return await ctx.prisma.recommendation.update({
          where: {
            id: recommendationId,
          },
          data: {
            seen: true,
          },
        });
      },
    });
  },
});

export const RecommendationQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getRecommendations', {
      type: RecommendationResults,
      args: {
        profileId: nonNull(intArg()),
        usedPages: list(intArg()),
        currentRecsInArray: intArg(),
      },
      resolve: async (_, { profileId, usedPages, currentRecsInArray }, ctx) => {
        const pageSize = 24;

        const totalUnseenRecommendationsCount = await ctx.prisma.recommendation.count({
          where: {
            profileId,
            seen: false,
          },
        });

        const totalPages = Math.ceil(totalUnseenRecommendationsCount / pageSize);
        let randomNumber;

        // Check if enough unseen recs in db, if not, serve accordingly
        const insufficientUnseen = totalUnseenRecommendationsCount < pageSize;
        const insufficientAdditionalRecs = currentRecsInArray >= totalUnseenRecommendationsCount;
        if (insufficientUnseen) {
          await ctx.prisma.recommendation.updateMany({
            where: {
              profileId,
            },
            data: {
              seen: false,
            },
          });

          randomNumber = Math.floor(Math.random() * totalPages) + 1;
          const recommendations = await ctx.prisma.recommendation.findMany({
            where: { profileId, seen: false },
            include: {
              crate: true,
            },
            take: pageSize,
            skip: (randomNumber - 1) * pageSize,
          });

          const recommendationsShuffled = [...recommendations];
          for (let i = recommendationsShuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [recommendationsShuffled[i], recommendationsShuffled[j]] = [
              recommendationsShuffled[j],
              recommendationsShuffled[i],
            ];
          }

          return {
            recommendations: recommendationsShuffled,
            usedPages: [randomNumber],
            currentRecsInArray: currentRecsInArray,
            resetRecommendations: true,
          };
        } else {
          if (insufficientAdditionalRecs) {
            // Reset the recommendations in broswer without rerolling db recs to unseen
            return {
              recommendations: [],
              usedPages: usedPages,
              currentRecsInArray: currentRecsInArray,
              resetRecommendations: false,
            };
          } else {
            // Serve additional recs
            if (!usedPages) {
              randomNumber = Math.floor(Math.random() * totalPages) + 1;
            } else {
              do {
                randomNumber = Math.floor(Math.random() * totalPages) + 1;
              } while (usedPages.includes(randomNumber));
            }

            const recommendations = await ctx.prisma.recommendation.findMany({
              where: { profileId, seen: false },
              include: {
                crate: true,
              },
              take: pageSize,
              skip: (randomNumber - 1) * pageSize,
            });

            const recommendationsShuffled = [...recommendations];
            for (let i = recommendationsShuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [recommendationsShuffled[i], recommendationsShuffled[j]] = [
                recommendationsShuffled[j],
                recommendationsShuffled[i],
              ];
            }

            return {
              recommendations: recommendationsShuffled || [],
              usedPages: usedPages ? [...usedPages, randomNumber] : [randomNumber],
              currentRecsInArray: currentRecsInArray,
              resetRecommendations: false,
            };
          }
        }
      },
    });
  },
});
