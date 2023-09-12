import { nonNull, extendType, inputObjectType, mutationType, stringArg, intArg } from 'nexus';
import {
  Crate as NexusCrate,
  Follow as NexusFollow,
  FollowRequest as NexusFollowRequest,
  FollowAndOrRequest as NexusFollowAndOrRequest,
  Tag as NexusTag,
  Label as NexusLabel,
  Album as NexusAlbum,
  SelectedSearchResult as NexusSelectedSearchResult,
} from './nexusTypes';
import { RequestStatusEnum } from './nexusEnums';
import axios from 'axios';

// INPUT OBJECT TYPES
export const FollowOrRequestInput = inputObjectType({
  name: 'FollowOrRequestInput',
  definition(t) {
    t.nonNull.int('follower');
    t.nonNull.int('following');
    t.nullable.boolean('followingIsPrivate');
    t.nullable.field('requestStatus', {
      type: RequestStatusEnum,
    });
  },
});

export const CrateProfileInput = inputObjectType({
  name: 'CrateProfileInput',
  definition(t) {
    t.nonNull.int('crateId');
    t.nonNull.int('profileId');
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

export const CrateInput = inputObjectType({
  name: 'CrateInput',
  definition(t) {
    t.nonNull.string('title');
    t.nonNull.string('description');
    t.nonNull.int('creatorId');
    t.nonNull.boolean('isRanked');
    t.list.int('labelIds');
    t.nonNull.list.field('crateAlbums', { type: CrateAlbumInput });
  },
});

// MUTATIONS
export const FollowMutations = mutationType({
  definition(t) {
    t.field('createNewFollowOrRequest', {
      type: NexusFollowAndOrRequest,
      args: {
        input: nonNull(FollowOrRequestInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { follower, following, followingIsPrivate } = input;
        const prisma = ctx.prisma;

        if (followingIsPrivate === false) {
          const follow = await prisma.follow.create({
            data: {
              follower: { connect: { id: follower } },
              following: { connect: { id: following } },
            },
            include: {
              follower: true,
              following: true,
            },
          });
          return { follow, followRequest: null };
        } else {
          const followRequest = await prisma.followRequest.create({
            data: {
              sender: { connect: { id: follower } },
              receiver: { connect: { id: following } },
              requestStatus: 'PENDING',
            },
            include: {
              sender: true,
              receiver: true,
            },
          });
          return { follow: null, followRequest };
        }
      },
    });

    t.field('unfollowProfile', {
      type: NexusFollow,
      args: {
        input: nonNull(FollowOrRequestInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { follower, following } = input;
        const prisma = ctx.prisma;

        const followToDelete = await prisma.follow.findFirst({
          where: {
            followerId: follower,
            followingId: following,
          },
        });

        console.log(followToDelete);

        if (!followToDelete) {
          throw new Error('Follow record not found');
        }

        const deletedFollow = {
          ...followToDelete,
        };

        await prisma.follow.delete({
          where: {
            id: followToDelete.id,
          },
        });

        return deletedFollow;
      },
    });

    t.field('rejectFollowRequest', {
      type: NexusFollowRequest,
      args: {
        input: nonNull(FollowOrRequestInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { follower, following } = input;
        const followRequest = await ctx.prisma.followRequest.findMany({
          where: {
            sender: { id: follower },
            receiver: { id: following },
          },
          orderBy: {
            sentAt: 'desc',
          },
        });

        if (!followRequest) {
          throw new Error('Follow request not found');
        }

        const updatedFollowRequest = await ctx.prisma.followRequest.update({
          where: { id: followRequest[0].id },
          data: { requestStatus: 'REJECTED' },
        });

        return updatedFollowRequest;
      },
    });

    t.field('acceptFollowRequest', {
      type: NexusFollowAndOrRequest,
      args: {
        input: nonNull(FollowOrRequestInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { follower, following } = input;

        const followRequest = await ctx.prisma.followRequest.findMany({
          where: {
            sender: { id: follower },
            receiver: { id: following },
          },
          orderBy: {
            sentAt: 'desc',
          },
          include: {
            sender: true,
            receiver: true,
          },
        });

        if (!followRequest) {
          throw new Error('Follow request not found');
        }

        const updatedFollowRequest = await ctx.prisma.followRequest.update({
          where: { id: followRequest[0].id },
          data: { requestStatus: 'ACCEPTED' },
          include: {
            sender: true,
            receiver: true,
          },
        });

        const follow = await ctx.prisma.follow.create({
          data: {
            follower: { connect: { id: updatedFollowRequest.senderId } },
            following: { connect: { id: updatedFollowRequest.receiverId } },
          },
        });

        return { followRequest: updatedFollowRequest, follow };
      },
    });
  },
});

export const CrateMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addCrateToFavorites', {
      type: NexusCrate,
      args: {
        input: nonNull(CrateProfileInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { crateId, profileId } = input;
        const crate = await ctx.prisma.crate.update({
          where: {
            id: crateId,
          },
          data: {
            favoritedBy: {
              connect: { id: profileId },
            },
          },
        });

        return crate;
      },
    });

    t.field('removeCrateFromFavorites', {
      type: NexusCrate,
      args: {
        input: nonNull(CrateProfileInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { crateId, profileId } = input;
        const crate = await ctx.prisma.crate.update({
          where: {
            id: crateId,
          },
          data: {
            favoritedBy: {
              disconnect: { id: profileId },
            },
          },
        });

        return crate;
      },
    });

    t.field('addNewCrate', {
      type: NexusCrate,
      args: {
        input: nonNull(CrateInput),
      },
      resolve: async (_, { input: { title, description, creatorId, isRanked, labelIds, crateAlbums } }, ctx) => {
        return ctx.prisma.crate.create({
          data: {
            title,
            description,
            isRanked,
            creator: {
              connect: { id: creatorId },
            },
            labels: {
              connect: labelIds.map(labelId => ({ id: labelId })),
            },
            albums: {
              create: crateAlbums.map(({ albumId, tagIds, order }) => ({
                album: {
                  connect: { id: albumId },
                },
                tags: {
                  connect: tagIds.map(tagId => ({ id: tagId })),
                },
                rank: order,
              })),
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
      type: NexusTag,
      args: {
        name: nonNull(stringArg()),
      },
      resolve: async (_, { name }, ctx) => {
        const newTag = await ctx.prisma.tag.create({
          data: {
            name,
          },
        });

        return newTag;
      },
    });
  },
});

export const LabelMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addNewLabel', {
      type: NexusLabel,
      args: {
        name: nonNull(stringArg()),
      },
      resolve: async (_, { name }, ctx) => {
        const newLabel = await ctx.prisma.label.create({
          data: {
            name,
            isStandard: false,
          },
        });

        return newLabel;
      },
    });
  },
});

export const AlbumMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addNewAlbum', {
      type: NexusAlbum,
      args: {
        discogsMasterId: nonNull(intArg()),
      },
      resolve: async (_, { discogsMasterId }, ctx) => {
        // Use master to get discogs Response
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

export const SelectedSearchResultMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.list.field('logSelectedSearchResult', {
      type: NexusSelectedSearchResult,
      args: {
        searchTerm: nonNull(stringArg()),
        prismaModel: nonNull(stringArg()),
        selectedId: nonNull(intArg()),
      },
      resolve: async (_, { searchTerm, prismaModel, selectedId }, ctx) => {
        let searchResult;

        switch (prismaModel) {
          case 'profile':
            const matchingProfile = await ctx.prisma.profile.findUnique({
              where: { id: selectedId },
              select: { username: true, searchAndSelectCount: true },
            });

            await ctx.prisma.profile.update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingProfile.searchAndSelectCount + 1 },
            });

            searchResult = matchingProfile.username;
            break;
          case 'crate':
          case 'album':
            const matchingTitleResult = await ctx.prisma[prismaModel].findUnique({
              where: { id: selectedId },
              select: { title: true, searchAndSelectCount: true },
            });

            await ctx.prisma[prismaModel].update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingTitleResult.searchAndSelectCount + 1 },
            });

            searchResult = matchingTitleResult.title;
            break;
          case 'label':
          case 'tag':
          case 'genre':
          case 'subgenre':
            const matchingNameResult = await ctx.prisma[prismaModel].findUnique({
              where: { id: selectedId },
              select: { name: true, searchAndSelectCount: true },
            });

            await ctx.prisma[prismaModel].update({
              where: { id: selectedId },
              data: { searchAndSelectCount: matchingNameResult.searchAndSelectCount + 1 },
            });

            searchResult = matchingNameResult.name;
            break;
          default:
            throw new Error('Invalid prismaModel');
        }

        const createdSelectedSearchResult = await ctx.prisma.selectedSearchResult.create({
          data: {
            searchTerm,
            resultType: prismaModel,
            searchResult,
            selectedId,
          },
        });

        // If prismaModel is 'album', create another SelectedSearchResult for title
        let albumTitleSelectedSearchResult;
        if (prismaModel === 'album') {
          const matchingArtistResult = await ctx.prisma.album.findUnique({
            where: { id: selectedId },
            select: { artist: true },
          });

          albumTitleSelectedSearchResult = await ctx.prisma.selectedSearchResult.create({
            data: {
              searchTerm,
              resultType: 'album',
              searchResult: matchingArtistResult.artist,
              selectedId,
            },
          });

          // NOTE: this is an interim solution before the Quick Results searchTerm implementation - i.e. assuming that selecting an album increases the entire artist's searchAndSelect ranking
          const artistAlbums = await ctx.prisma.album.findMany({
            where: { artist: matchingArtistResult.artist, NOT: { id: selectedId } },
            select: { id: true, searchAndSelectCount: true },
          });

          for (const album of artistAlbums) {
            await ctx.prisma.album.update({
              where: { id: album.id },
              data: { searchAndSelectCount: album.searchAndSelectCount + 1 },
            });
          }
        }

        return [createdSelectedSearchResult, albumTitleSelectedSearchResult];
      },
    });
  },
});
