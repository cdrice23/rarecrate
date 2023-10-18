import { queryType, nonNull, intArg, stringArg, nullable, extendType, booleanArg, list } from 'nexus';
import {
  Profile as NexusProfile,
  Crate as NexusCrate,
  FollowRequest as NexusFollowRequest,
  Label as NexusLabel,
  Tag as NexusTag,
  Album as NexusAlbum,
  Genre as NexusGenre,
  Subgenre as NexusSubgenre,
  NotificationSettings as NexusNotificationSettings,
  Notification as NexusNotification,
  Recommendation as NexusRecommendation,
  RecommendationResults as NexusRecommendationResults,
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

    t.nonNull.list.field('qsProfiles', {
      type: NexusProfile,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        const pageSize = 99999;
        let pageNumber = 1;
        let allProfiles = [];

        while (true) {
          const profiles = await ctx.prisma.profile.findMany({
            where: {
              username: {
                contains: searchTerm,
              },
            },
            orderBy: {
              searchAndSelectCount: 'desc',
            },
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
          });

          if (profiles.length === 0) {
            break; // Break the loop if no more profiles are returned
          }

          allProfiles = allProfiles.concat(profiles);
          pageNumber++;
        }

        const topProfiles = allProfiles.slice(0, 9);
        return topProfiles;
      },
    });

    t.nonNull.list.field('fsProfiles', {
      type: NexusProfile,
      args: {
        searchTerm: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const profiles = await ctx.prisma.profile.findMany({
          where: {
            username: {
              contains: searchTerm,
            },
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return profiles;
      },
    });

    t.nonNull.field('getLastLoginProfile', {
      type: NexusProfile,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: userId },
        });

        let lastLoginProfile;

        if (user.lastLoginProfile) {
          lastLoginProfile = await ctx.prisma.profile.findUnique({
            where: { id: user.lastLoginProfile },
            select: {
              id: true,
              username: true,
            },
          });
        }

        if (lastLoginProfile) {
          return lastLoginProfile;
        } else {
          const userProfiles = await ctx.prisma.profile.findMany({
            where: { user: { id: userId } },
            select: {
              id: true,
              username: true,
            },
          });
          return userProfiles[0];
        }
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

    t.nonNull.list.field('qsCrates', {
      type: NexusCrate,
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
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: 9,
        });
      },
    });

    t.nonNull.list.field('fsCrates', {
      type: NexusCrate,
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
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getCratesFromLabel', {
      type: NexusCrate,
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
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return crates;
      },
    });

    t.nonNull.list.field('getCratesFromAlbum', {
      type: NexusCrate,
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
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return crates;
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
    t.nonNull.list.field('searchLabelsByName', {
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

    t.nonNull.field('searchLabelsById', {
      type: NexusLabel,
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

    t.nonNull.list.field('qsLabels', {
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
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: 9,
        });
      },
    });

    t.nonNull.list.field('fsLabels', {
      type: NexusLabel,
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
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return labels;
      },
    });
  },
});

export const TagQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchTagsByName', {
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

    t.nonNull.field('searchTagsById', {
      type: NexusTag,
      args: {
        tagId: nonNull(intArg()),
      },
      resolve: async (_, { tagId }, ctx) => {
        return await ctx.prisma.tag.findUnique({
          where: {
            id: tagId,
          },
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

    t.nonNull.list.field('qsTags', {
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
          orderBy: {
            searchAndSelectCount: 'desc',
          },
          take: 9,
        });
      },
    });

    t.nonNull.list.field('fsTags', {
      type: NexusTag,
      args: {
        searchTerm: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const tags = await ctx.prisma.tag.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        return tags;
      },
    });
  },
});

export const AlbumQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchPrismaAlbumsByName', {
      type: NexusAlbum,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        const pageSize = 99999;
        let pageNumber = 1;
        let allAlbums = [];

        while (true) {
          const albums = await ctx.prisma.album.findMany({
            where: {
              OR: [
                {
                  artist: {
                    contains: searchTerm,
                  },
                },
                {
                  title: {
                    contains: searchTerm,
                  },
                },
              ],
            },
            orderBy: [
              {
                searchAndSelectCount: 'desc',
              },
            ],
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
          });

          if (albums.length === 0) {
            break; // Break the loop if no more profiles are returned
          }

          allAlbums = allAlbums.concat(albums);
          pageNumber++;
        }

        const ids = new Set();
        const uniqueResults = allAlbums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });
        // const top9Profiles = uniqueResults.slice(0, 9);
        // return top9Profiles;
        return uniqueResults;
      },
    });

    t.nonNull.field('searchPrismaAlbumsById', {
      type: NexusAlbum,
      args: {
        albumId: nonNull(intArg()),
      },
      resolve: async (_, { albumId }, ctx) => {
        return await ctx.prisma.album.findUnique({
          where: {
            id: albumId,
          },
        });
      },
    });

    t.nonNull.list.field('qsAlbums', {
      type: NexusAlbum,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        const pageSize = 99999;
        let pageNumber = 1;
        let allAlbums = [];

        while (true) {
          const albums = await ctx.prisma.album.findMany({
            where: {
              OR: [
                {
                  artist: {
                    contains: searchTerm,
                  },
                },
                {
                  title: {
                    contains: searchTerm,
                  },
                },
              ],
            },
            orderBy: [
              {
                searchAndSelectCount: 'desc',
              },
            ],
            skip: pageSize * (pageNumber - 1),
            take: pageSize,
          });

          if (albums.length === 0) {
            break; // Break the loop if no more profiles are returned
          }

          allAlbums = allAlbums.concat(albums);
          pageNumber++;
        }

        const ids = new Set();
        const uniqueResults = allAlbums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });
        const top4Albums = uniqueResults.slice(0, 4);
        return top4Albums;
      },
    });

    t.nonNull.list.field('fsAlbums', {
      type: NexusAlbum,
      args: {
        searchTerm: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const albums = await ctx.prisma.album.findMany({
          where: {
            OR: [
              {
                artist: {
                  contains: searchTerm,
                },
              },
              {
                title: {
                  contains: searchTerm,
                },
              },
            ],
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        const ids = new Set();
        const uniqueResults = albums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });

        return uniqueResults;
      },
    });

    t.nonNull.list.field('getAlbumsFromTag', {
      type: NexusAlbum,
      args: {
        tagId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { tagId, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const albums = await ctx.prisma.album.findMany({
          where: {
            crates: {
              some: {
                tags: {
                  some: {
                    id: tagId,
                  },
                },
              },
            },
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        const ids = new Set();
        const uniqueResults = albums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });

        return uniqueResults;
      },
    });

    t.nonNull.list.field('getAlbumsFromGenre', {
      type: NexusAlbum,
      args: {
        genreId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { genreId, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const albums = await ctx.prisma.album.findMany({
          where: {
            genres: {
              some: {
                id: genreId,
              },
            },
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        const ids = new Set();
        const uniqueResults = albums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });

        return uniqueResults;
      },
    });

    t.nonNull.list.field('getAlbumsFromSubgenre', {
      type: NexusAlbum,
      args: {
        subgenreId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { subgenreId, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const albums = await ctx.prisma.album.findMany({
          where: {
            subgenres: {
              some: {
                id: subgenreId,
              },
            },
          },
          orderBy: [
            {
              searchAndSelectCount: 'desc',
            },
          ],
          skip: skip,
          take: 30,
        });

        const ids = new Set();
        const uniqueResults = albums.filter(album => {
          if (!ids.has(album.id)) {
            ids.add(album.id);
            return true;
          }
          return false;
        });

        return uniqueResults;
      },
    });
  },
});

export const GenreQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('qsGenres', {
      type: NexusGenre,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.genre.findMany({
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

    t.nonNull.list.field('fsGenres', {
      type: NexusGenre,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.genre.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          orderBy: {
            searchAndSelectCount: 'desc',
          },
        });
      },
    });
  },
});

export const SubgenreQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('qsSubgenres', {
      type: NexusSubgenre,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.subgenre.findMany({
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

    t.nonNull.list.field('fsSubgenres', {
      type: NexusSubgenre,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        return await ctx.prisma.subgenre.findMany({
          where: {
            name: {
              contains: searchTerm,
            },
          },
          orderBy: {
            searchAndSelectCount: 'desc',
          },
        });
      },
    });
  },
});

export const NotificationSettingsQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getNotificationSettingsByUser', {
      type: NexusNotificationSettings,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        return await ctx.prisma.notificationSettings.findUnique({
          where: {
            userId,
          },
        });
      },
    });
  },
});

export const NotificationQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('getNotificationsByProfile', {
      type: NexusNotification,
      args: {
        profileId: nonNull(intArg()),
        userId: nonNull(intArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { profileId, userId, currentPage }, ctx) => {
        const notificationSettings = await ctx.prisma.notificationSettings.findUnique({
          where: {
            userId,
          },
        });

        let notifications = await ctx.prisma.notification.findMany({
          where: { receiver: profileId },
          orderBy: [
            {
              createdAt: 'desc',
            },
          ],
          include: {
            connectedCrate: true,
            connectedFollow: true,
          },
        });

        // Filter the notifications based on the notificationSettings
        notifications = await Promise.all(
          notifications.map(async notification => {
            // Check to return notifications of profile's new followers
            if (notificationSettings.showOwnNewFollowers && notification.type === 'newFollow') {
              const follow = await ctx.prisma.follow.findUnique({ where: { id: notification.followId } });
              if (follow && follow.followingId === profileId) {
                return notification;
              }
            }

            // Check to return notifications of profile's crates being favorited
            if (notificationSettings.showOwnNewFavorites && notification.type === 'newFavorite') {
              const crate = await ctx.prisma.crate.findUnique({ where: { id: notification.crateId } });
              if (crate && crate.creatorId === profileId) {
                return notification;
              }
            }

            // Check to return notifications of profile's followed profiles when they follow new profiles
            if (notificationSettings.showFollowingNewFollows && notification.type === 'newFollow') {
              const follow = await ctx.prisma.follow.findUnique({ where: { id: notification.followId } });
              if (follow && follow.followingId !== profileId) {
                return notification;
              }
            }

            // Check to return notifications of profile's followed profiles when they create a new crate
            if (notificationSettings.showFollowingNewCrates && notification.type === 'newCrate') {
              return notification;
            }

            // Check to return notifications of profile's followed profiles when the favorite a new crate
            if (notificationSettings.showFollowingNewFavorites && notification.type === 'newFavorite') {
              const crate = await ctx.prisma.crate.findUnique({ where: { id: notification.crateId } });
              if (crate && crate.creatorId !== profileId) {
                return notification;
              }
            }
          }),
        );

        // Remove undefined values after the filter
        notifications = notifications.filter(notification => notification !== null);

        // Paginate and grab notifications
        const pageSize = 30;
        const numPages = Math.ceil(notifications.length / pageSize);

        // If the requested page number is greater than the number of pages, adjust it
        if (currentPage > numPages) {
          return [];
        }

        // If notifications < pageSize, just return notifications
        if (notifications.length <= pageSize) {
          return notifications;
        } else if (currentPage <= numPages) {
          // Othewrwise, return paginated records
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const notificationsForPage = notifications.slice(startIndex, endIndex);

          return notificationsForPage;
        }
      },
    });
  },
});

export const RecommendationQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getRecommendations', {
      type: NexusRecommendationResults,
      args: {
        profileId: nonNull(intArg()),
        usedPages: list(intArg()),
        totalRecommendations: intArg(),
      },
      resolve: async (_, { profileId, usedPages, totalRecommendations }, ctx) => {
        const pageSize = 24;
        let totalUnseenRecommendationsCount;

        const totalSeenRecommendationsCount = await ctx.prisma.recommendation.count({
          where: {
            profileId,
            seen: true,
          },
        });

        const totalRecommendationsCount = await ctx.prisma.recommendation.count({
          where: { profileId },
        });

        if (!totalRecommendations) {
          totalUnseenRecommendationsCount = totalRecommendationsCount - totalSeenRecommendationsCount;
        } else {
          totalUnseenRecommendationsCount = totalRecommendations;
        }

        const totalPages = Math.ceil(totalUnseenRecommendationsCount / pageSize);
        let randomNumber;

        // TRYING NEW LOGIC HERE:
        const insufficientUnseen = totalUnseenRecommendationsCount - pageSize <= pageSize;
        const insufficientAdditionalRecs = (usedPages || []).length * pageSize >= totalUnseenRecommendationsCount;
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

          return {
            recommendations: recommendations,
            usedPages: [randomNumber],
            totalRecommendations: totalUnseenRecommendationsCount,
            resetRecommendations: true,
          };
        } else {
          if (insufficientAdditionalRecs) {
            // Reset the recommendations in broswer without rerolling db recs to unseen
            randomNumber = Math.floor(Math.random() * totalPages) + 1;
            const recommendations = await ctx.prisma.recommendation.findMany({
              where: { profileId, seen: false },
              include: {
                crate: true,
              },
              take: pageSize,
              skip: (randomNumber - 1) * pageSize,
            });

            return {
              recommendations: recommendations,
              usedPages: [randomNumber],
              totalRecommendations: totalUnseenRecommendationsCount,
              resetRecommendations: true,
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

            return {
              recommendations: recommendations || [],
              usedPages: usedPages ? [...usedPages, randomNumber] : [randomNumber],
              totalRecommendations: totalUnseenRecommendationsCount,
              resetRecommendations: false,
            };
          }
        }
      },
    });
  },
});
