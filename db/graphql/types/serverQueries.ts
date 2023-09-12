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

    // t.nonNull.list.field('qsProfiles', {
    //   type: NexusProfile,
    //   args: {
    //     searchTerm: nonNull(stringArg()),
    //   },
    //   resolve: async (_, { searchTerm }, ctx) => {
    //       return await ctx.prisma.profile.findMany({
    //         where: {
    //           username: {
    //             contains: searchTerm
    //           }
    //         },
    //         orderBy: {
    //           searchAndSelectCount: 'desc',
    //         },
    //         take: 9
    //       });
    //   },
    // });
    t.nonNull.list.field('qsProfiles', {
      type: NexusProfile,
      args: {
        searchTerm: nonNull(stringArg()),
      },
      resolve: async (_, { searchTerm }, ctx) => {
        const pageSize = 90000; // Set the page size to 90,000 records
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
            skip: pageSize * (pageNumber - 1), // Calculate the number of records to skip based on the page number and page size
            take: pageSize, // Retrieve the specified page size
          });

          if (profiles.length === 0) {
            break; // Break the loop if no more profiles are returned
          }

          allProfiles = allProfiles.concat(profiles);
          pageNumber++;
        }

        const filteredProfiles = allProfiles.filter(profile => profile.username.includes(searchTerm));
        const sortedProfiles = filteredProfiles.sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount);
        const top9Profiles = sortedProfiles.slice(0, 9);
        return top9Profiles;
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
        const top9Profiles = uniqueResults.slice(0, 9);
        return top9Profiles;
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
  },
});
