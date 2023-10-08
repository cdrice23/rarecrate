import { queryType, nonNull, intArg, stringArg, nullable, extendType, booleanArg } from 'nexus';
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
