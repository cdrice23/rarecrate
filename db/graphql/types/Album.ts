import axios from 'axios';
import { objectType, inputObjectType, nonNull, intArg, stringArg, extendType } from 'nexus';
import {
  Album as PrismaAlbum,
  Genre as PrismaGenre,
  Subgenre as PrismaSubgenre,
  TracklistItem as PrismaTracklistItem,
  CrateAlbum as PrismaCrateAlbum,
  Tag as PrismaTag,
} from 'nexus-prisma';
import { Crate } from './Crate';

export const Album = objectType({
  name: PrismaAlbum.$name,
  definition(t) {
    t.field(PrismaAlbum.id.name, {
      type: PrismaAlbum.id.type,
    });
    t.field(PrismaAlbum.discogsMasterId.name, {
      type: PrismaAlbum.discogsMasterId.type,
    });
    t.field(PrismaAlbum.title.name, {
      type: PrismaAlbum.title.type,
    });
    t.field(PrismaAlbum.artist.name, {
      type: PrismaAlbum.artist.type,
    });
    t.field(PrismaAlbum.label.name, {
      type: PrismaAlbum.label.type,
    });
    t.field(PrismaAlbum.releaseYear.name, {
      type: PrismaAlbum.releaseYear.type,
    });
    t.list.field(PrismaAlbum.genres.name, {
      type: Genre,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.genre.findMany({
          where: { albums: { some: { id: parent.id } } },
        });
      },
    });
    t.list.field(PrismaAlbum.subgenres.name, {
      type: Subgenre,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.subgenre.findMany({
          where: { albums: { some: { id: parent.id } } },
        });
      },
    });
    t.field(PrismaAlbum.imageUrl.name, {
      type: PrismaAlbum.imageUrl.type,
    });
    t.field(PrismaAlbum.crates.name, {
      type: CrateAlbum,
    });
    t.list.field(PrismaAlbum.tracklist.name, {
      type: TracklistItem,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.tracklistItem.findMany({
          where: { albumId: parent.id },
        });
      },
    });
    t.field(PrismaAlbum.searchAndSelectCount.name, {
      type: PrismaAlbum.searchAndSelectCount.type,
    });
  },
});

export const Genre = objectType({
  name: PrismaGenre.$name,
  definition(t) {
    t.field(PrismaGenre.id.name, {
      type: PrismaGenre.id.type,
    });
    t.field(PrismaGenre.name.name, {
      type: PrismaGenre.name.type,
    });
    t.field(PrismaGenre.albums.name, {
      type: Album,
    });
    t.field(PrismaGenre.subgenres.name, {
      type: Subgenre,
    });
    t.field(PrismaGenre.searchAndSelectCount.name, {
      type: PrismaGenre.searchAndSelectCount.type,
    });
  },
});

export const Subgenre = objectType({
  name: PrismaSubgenre.$name,
  definition(t) {
    t.field(PrismaSubgenre.id.name, {
      type: PrismaSubgenre.id.type,
    });
    t.field(PrismaSubgenre.name.name, {
      type: PrismaSubgenre.name.type,
    });
    t.field(PrismaSubgenre.albums.name, {
      type: Album,
    });
    t.field(PrismaSubgenre.parentGenre.name, {
      type: Genre,
    });
    t.field(PrismaSubgenre.parentGenreId.name, {
      type: PrismaSubgenre.parentGenreId.type,
    });
    t.field(PrismaSubgenre.searchAndSelectCount.name, {
      type: PrismaSubgenre.searchAndSelectCount.type,
    });
  },
});

export const TracklistItem = objectType({
  name: PrismaTracklistItem.$name,
  definition(t) {
    t.field(PrismaTracklistItem.id.name, {
      type: PrismaTracklistItem.id.type,
    });
    t.field(PrismaTracklistItem.title.name, {
      type: PrismaTracklistItem.title.type,
    });
    t.field(PrismaTracklistItem.order.name, {
      type: PrismaTracklistItem.order.type,
    });
    t.field(PrismaTracklistItem.album.name, {
      type: Album,
    });
    t.field(PrismaTracklistItem.albumId.name, {
      type: PrismaTracklistItem.albumId.type,
    });
  },
});

export const CrateAlbum = objectType({
  name: PrismaCrateAlbum.$name,
  definition(t) {
    t.field(PrismaCrateAlbum.id.name, {
      type: PrismaCrateAlbum.id.type,
    });
    t.field(PrismaCrateAlbum.crate.name, {
      type: Crate,
    });
    t.field(PrismaCrateAlbum.crateId.name, {
      type: PrismaCrateAlbum.crateId.type,
    });
    t.field(PrismaCrateAlbum.album.name, {
      type: Album,
      resolve: async (root, _, ctx) => {
        const album = await ctx.prisma.album.findUnique({
          where: {
            id: root.albumId,
          },
          include: {
            genres: true,
            subgenres: true,
            tracklist: true,
          },
        });

        return album;
      },
    });
    t.field(PrismaCrateAlbum.albumId.name, {
      type: PrismaCrateAlbum.albumId.type,
    });
    t.field(PrismaCrateAlbum.rank.name, {
      type: PrismaCrateAlbum.rank.type,
    });
    t.list.field(PrismaCrateAlbum.tags.name, {
      type: Tag,
      resolve: async (root, _, ctx) => {
        const tags = await ctx.prisma.crateAlbum
          .findUnique({
            where: {
              id: root.id,
            },
          })
          .tags();

        return tags;
      },
    });
  },
});

export const Tag = objectType({
  name: PrismaTag.$name,
  definition(t) {
    t.field(PrismaTag.id.name, {
      type: PrismaTag.id.type,
    });
    t.field(PrismaTag.name.name, {
      type: PrismaTag.name.type,
    });
    t.list.field(PrismaTag.crateAlbum.name, {
      type: CrateAlbum,
    });
    t.field(PrismaTag.searchAndSelectCount.name, {
      type: PrismaTag.searchAndSelectCount.type,
    });
  },
});

export const CrateAlbumInput = inputObjectType({
  name: 'CrateAlbumInput',
  definition(t) {
    t.nonNull.int('albumId');
    t.list.int('tagIds');
    t.int('order');
  },
});

export const TagQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('searchTagsByName', {
      type: Tag,
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
      type: Tag,
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
      type: Tag,
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
      type: Tag,
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
      type: Tag,
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
      type: Album,
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
      type: Album,
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
      type: Album,
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
      type: Album,
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
      type: Album,
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
      type: Album,
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
      type: Album,
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
      type: Genre,
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
      type: Genre,
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
        });
      },
    });
  },
});

export const SubgenreQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('qsSubgenres', {
      type: Subgenre,
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
      type: Subgenre,
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
        });
      },
    });
  },
});

export const TagMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addNewTag', {
      type: Tag,
      args: {
        name: nonNull(stringArg()),
      },
      resolve: async (_, { name }, ctx) => {
        const existingTag = await ctx.prisma.tag.findUnique({
          where: {
            name,
          },
        });

        if (existingTag) {
          return existingTag;
        } else {
          const newTag = await ctx.prisma.tag.create({
            data: {
              name,
            },
          });

          return newTag;
        }
      },
    });
  },
});

export const AlbumMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addNewAlbum', {
      type: Album,
      args: {
        discogsMasterId: nonNull(intArg()),
      },
      resolve: async (_, { discogsMasterId }, ctx) => {
        const existingAlbum = await ctx.prisma.album.findUnique({
          where: {
            discogsMasterId: discogsMasterId,
          },
          include: {
            genres: true,
            subgenres: true,
            tracklist: true,
          },
        });

        // If the album exists, return it
        if (existingAlbum) {
          return existingAlbum;
        }

        // Otherwise, use master to get discogs Response & build album data
        const masterResponse = await axios.get(`https://api.discogs.com/masters/${discogsMasterId}`, {
          headers: {
            Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
          },
        });

        const releaseResponse = await axios.get(
          `https://api.discogs.com/releases/${masterResponse.data.main_release}`,
          {
            headers: {
              Authorization: `Discogs key=${process.env.DISCOGS_API_KEY}, secret=${process.env.DISCOGS_API_SECRET}`,
            },
          },
        );

        // OG album structure
        const formattedDiscogsResponse = {
          discogsMasterId,
          title: masterResponse.data.title,
          artist: masterResponse.data.artists[0].name,
          label: releaseResponse.data.labels[0].name ?? '',
          releaseYear: masterResponse.data.year ?? null,
          genres: masterResponse.data.genres ?? [],
          subgenres: masterResponse.data.styles ?? [],
          imageUrl: masterResponse.data.images[0].uri ?? '',
          tracklist: masterResponse.data.tracklist
            ? masterResponse.data.tracklist.map((track: any, i: number) => ({
                order: i + 1,
                name: track.title,
              }))
            : [],
        };

        // Create or connect the Genre records
        const createOrConnectGenres = async (genres, ctx) => {
          const genrePromises = genres.map(async genre => {
            const existingGenre = await ctx.prisma.genre.findFirst({
              where: { name: genre },
            });

            if (existingGenre) {
              return { ...existingGenre };
            } else {
              return ctx.prisma.genre.create({
                data: { name: genre },
              });
            }
          });

          return Promise.all(genrePromises);
        };
        const genres = formattedDiscogsResponse.genres;
        const albumGenres = genres.length > 0 ? await createOrConnectGenres(genres, ctx) : [];

        // Create or connect the Subgenre records
        const createOrConnectSubgenres = async (subgenres, parentGenreName, albumGenres, ctx) => {
          const parentGenre = albumGenres.find(genre => genre.name === parentGenreName);
          const subgenrePromises = subgenres.map(async subgenre => {
            const existingSubgenre = await ctx.prisma.subgenre.findFirst({
              where: { name: subgenre },
            });

            if (existingSubgenre) {
              return { ...existingSubgenre };
            } else {
              return ctx.prisma.subgenre.create({
                data: {
                  name: subgenre,
                  parentGenre: { connect: { id: parentGenre.id } },
                },
              });
            }
          });

          return Promise.all(subgenrePromises);
        };
        const subgenres = formattedDiscogsResponse.subgenres;
        const albumSubgenres =
          subgenres.length > 0 ? await createOrConnectSubgenres(subgenres, genres[0], albumGenres, ctx) : [];

        // Create the Album record
        const newAlbum = await ctx.prisma.album.create({
          data: {
            discogsMasterId: formattedDiscogsResponse.discogsMasterId,
            title: formattedDiscogsResponse.title,
            artist: formattedDiscogsResponse.artist,
            label: formattedDiscogsResponse.label,
            releaseYear: parseInt(formattedDiscogsResponse.releaseYear),
            genres: { connect: albumGenres.map(genre => ({ id: genre.id })) },
            subgenres: { connect: albumSubgenres.map(subgenre => ({ id: subgenre.id })) },
            imageUrl: formattedDiscogsResponse.imageUrl,
            tracklist: {
              create: formattedDiscogsResponse.tracklist.map((item: any) => ({
                title: item.name,
                order: item.order,
              })),
            },
          },
        });
        return newAlbum;
      },
    });
  },
});
