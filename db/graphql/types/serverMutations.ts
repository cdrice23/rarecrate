import { nonNull, extendType, inputObjectType, mutationType, stringArg, intArg } from 'nexus';
import {
  User as NexusUser,
  Profile as NexusProfile,
  Crate as NexusCrate,
  Follow as NexusFollow,
  FollowRequest as NexusFollowRequest,
  FollowAndOrRequest as NexusFollowAndOrRequest,
  Tag as NexusTag,
  Label as NexusLabel,
  Album as NexusAlbum,
  SelectedSearchResult as NexusSelectedSearchResult,
  NotificationSettings as NexusNotificationSettings,
  Notification as NexusNotification,
  Recommendation as NexusRecommendation,
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
    t.int('id');
    t.nonNull.string('title');
    t.nonNull.string('description');
    t.nonNull.int('creatorId');
    t.nonNull.boolean('isRanked');
    t.list.int('labelIds');
    t.nonNull.list.field('crateAlbums', { type: CrateAlbumInput });
  },
});

export const SocialLinkInput = inputObjectType({
  name: 'SocialLinkInput',
  definition(t) {
    t.nonNull.string('platform');
    t.nonNull.string('username');
  },
});

export const ProfileInput = inputObjectType({
  name: 'ProfileInput',
  definition(t) {
    t.int('id');
    t.int('userId');
    t.nonNull.string('username');
    t.nonNull.boolean('isPrivate');
    t.string('bio');
    t.string('image');
    t.list.field('socialLinks', { type: SocialLinkInput });
  },
});

export const NotificationSettingsInput = inputObjectType({
  name: 'NotificationSettingsInput',
  definition(t) {
    t.nonNull.int('userId');
    t.nonNull.boolean('showOwnNewFollowers');
    t.nonNull.boolean('showOwnNewFavorites');
    t.nonNull.boolean('showFollowingNewFollows');
    t.nonNull.boolean('showFollowingNewCrates');
    t.nonNull.boolean('showFollowingNewFavorites');
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

    t.list.field('autoAcceptFollowRequests', {
      type: NexusFollowAndOrRequest,
      args: {
        receiverId: nonNull(intArg()),
      },
      resolve: async (_, { receiverId }, ctx) => {
        const followRequests = await ctx.prisma.followRequest.findMany({
          where: {
            receiverId,
            requestStatus: 'PENDING',
          },
        });

        const result = [];

        for (const followRequest of followRequests) {
          // Update the followRequest status to 'ACCEPTED'
          const updatedFollowRequest = await ctx.prisma.followRequest.update({
            where: { id: followRequest.id },
            data: { requestStatus: 'ACCEPTED' },
            include: {
              sender: true,
              receiver: true,
            },
          });

          // Create a new Follow record for the updatedFollowRequest
          const newFollow = await ctx.prisma.follow.create({
            data: {
              follower: { connect: { id: updatedFollowRequest.senderId } },
              following: { connect: { id: updatedFollowRequest.receiverId } },
            },
          });

          // Add the updatedFollowRequest and newFollow to the result array
          result.push({
            follow: newFollow,
            followRequest: updatedFollowRequest,
          });
        }

        return result;
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
          include: {
            creator: true,
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

    t.field('updateCrate', {
      type: NexusCrate,
      args: {
        input: nonNull(CrateInput),
      },
      resolve: async (_, { input: { id, title, description, isRanked, labelIds, crateAlbums } }, ctx) => {
        // Find existing labels on Crate
        const existingLabels = await ctx.prisma.crate.findMany({
          where: { id: id },
          include: { labels: true },
        });

        // Map existing labelIds
        const existingLabelIds = existingLabels[0].labels.map(label => label.id);

        // Identify labels to disconnect
        const labelsToDisconnect = existingLabelIds.filter(existingLabelId => !labelIds.includes(existingLabelId));

        // Identify new labels to connect
        const newLabelIds = labelIds.filter(labelId => !existingLabelIds.includes(labelId));

        // Get all existing crateAlbums
        const existingCrateAlbums = await ctx.prisma.crateAlbum.findMany({
          where: { crateId: id },
          include: { album: true, tags: true },
        });

        // Identify crateAlbums to create
        const newCrateAlbums = crateAlbums.filter(
          crateAlbum => !existingCrateAlbums.map(existing => existing.album.id).includes(crateAlbum.albumId),
        );

        // Identify crateAlbums to disconnect
        const crateAlbumsToDisconnect = existingCrateAlbums.filter(
          crateAlbum => !crateAlbums.some(inputCrateAlbum => inputCrateAlbum.albumId === crateAlbum.album.id),
        );

        // Identify crateAlbums to update
        const existingCrateAlbumsToUpdate = existingCrateAlbums.filter(existingCrateAlbum =>
          crateAlbums.some(crateAlbum => crateAlbum.albumId === existingCrateAlbum.album.id),
        );

        // Create new crateAlbums
        let newlyCreatedCrateAlbums = [];
        for (const newCrateAlbum of newCrateAlbums) {
          const createdCrateAlbum = await ctx.prisma.crateAlbum.create({
            data: {
              crate: {
                connect: { id: id },
              },
              album: {
                connect: { id: newCrateAlbum.albumId },
              },
              tags: {
                connect: newCrateAlbum.tagIds.map(tagId => ({ id: tagId })),
              },
              rank: newCrateAlbum.order,
            },
          });
          newlyCreatedCrateAlbums.push(createdCrateAlbum);
        }

        // Disconnect crateAlbums
        for (const crateAlbumToDisconnect of crateAlbumsToDisconnect) {
          await ctx.prisma.crateAlbum.delete({
            where: { id: crateAlbumToDisconnect.id },
          });
        }

        // Update crateAlbums
        for (const existingCrateAlbumToUpdate of existingCrateAlbumsToUpdate) {
          const existingTags = existingCrateAlbumToUpdate.tags.flatMap(tag => tag.id);
          const tagsToConnect = crateAlbums
            .find(album => album.albumId === existingCrateAlbumToUpdate.album.id)
            .tagIds.filter(tagId => !existingTags.includes(tagId));
          const tagsToDisconnect = existingTags.filter(
            tagId =>
              !crateAlbums.find(album => album.albumId === existingCrateAlbumToUpdate.album.id).tagIds.includes(tagId),
          );

          await ctx.prisma.crateAlbum.update({
            where: { id: existingCrateAlbumToUpdate.id },
            data: {
              tags: {
                connect: tagsToConnect.map(tag => ({ id: tag })),
                disconnect: tagsToDisconnect.map(tag => ({ id: tag })),
              },
              rank: crateAlbums.find(album => album.albumId === existingCrateAlbumToUpdate.album.id).order,
            },
          });
        }

        //update crate
        return ctx.prisma.crate.update({
          where: { id },
          data: {
            title,
            description,
            isRanked,
            labels: {
              connect: newLabelIds.map(labelId => ({ id: labelId })),
              disconnect: labelsToDisconnect.map(labelId => ({ id: labelId })),
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
        searchTerm: stringArg(),
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
            ...(searchTerm && { searchTerm }),
            resultType: prismaModel,
            searchResult,
            selectedId,
          },
        });

        // NOTE - Artist solution causing too many writes, so freezing this for now
        // If prismaModel is 'album', create another SelectedSearchResult for title
        // let albumTitleSelectedSearchResult;
        // if (prismaModel === 'album') {
        //   const matchingArtistResult = await ctx.prisma.album.findUnique({
        //     where: { id: selectedId },
        //     select: { artist: true },
        //   });

        //   albumTitleSelectedSearchResult = await ctx.prisma.selectedSearchResult.create({
        //     data: {
        //       ...(searchTerm && { searchTerm }),
        //       resultType: 'album',
        //       searchResult: matchingArtistResult.artist,
        //       selectedId,
        //     },
        //   });

        //   // NOTE: this is an interim solution before the Quick Results searchTerm implementation - i.e. assuming that selecting an album increases the entire artist's searchAndSelect ranking
        //   const artistAlbums = await ctx.prisma.album.findMany({
        //     where: { artist: matchingArtistResult.artist, NOT: { id: selectedId } },
        //     select: { id: true, searchAndSelectCount: true },
        //   });

        //   for (const album of artistAlbums) {
        //     await ctx.prisma.album.update({
        //       where: { id: album.id },
        //       data: { searchAndSelectCount: album.searchAndSelectCount + 1 },
        //     });
        //   }
        // }

        // return [createdSelectedSearchResult, albumTitleSelectedSearchResult];
        return [createdSelectedSearchResult];
      },
    });
  },
});

export const ProfileMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNewProfile', {
      type: NexusProfile,
      args: {
        input: nonNull(ProfileInput),
      },
      resolve: async (_, { input: { userId, username, isPrivate, bio, image, socialLinks } }, ctx) => {
        return ctx.prisma.profile.create({
          data: {
            user: {
              connect: { id: userId },
            },
            username,
            isPrivate,
            bio,
            image,
            socialLinks: {
              create: socialLinks.map(socialLink => ({
                platform: socialLink.platform,
                username: socialLink.username,
              })),
            },
          },
        });
      },
    });

    t.field('updateProfile', {
      type: NexusProfile,
      args: {
        input: nonNull(ProfileInput),
      },
      resolve: async (_, { input }, ctx) => {
        const { id, socialLinks, ...rest } = input;

        // Get all existing socialLinks for the profile
        const existingSocialLinks = await ctx.prisma.socialLink.findMany({
          where: {
            profileId: id,
          },
        });

        // Prepare data for socialLinks
        const socialLinksData = socialLinks.map(async link => {
          // Find existing SocialLink
          const existingSocialLink = existingSocialLinks.find(socialLink => socialLink.platform === link.platform);

          if (existingSocialLink) {
            // Update existing SocialLink
            return ctx.prisma.socialLink.update({
              where: { id: existingSocialLink.id },
              data: {
                username: link.username,
              },
            });
          } else {
            // Create new SocialLink
            return ctx.prisma.socialLink.create({
              data: {
                platform: link.platform,
                username: link.username,
                profile: { connect: { id } },
              },
            });
          }
        });

        // Wait for all socialLinks to be processed
        await Promise.all(socialLinksData);

        // Find and delete socialLinks that are in the db but not in input.socialLinks
        const socialLinksToDelete = existingSocialLinks.filter(
          socialLink => !socialLinks.some(link => link.platform === socialLink.platform),
        );

        await Promise.all(socialLinksToDelete.map(link => ctx.prisma.socialLink.delete({ where: { id: link.id } })));

        // Update profile
        return ctx.prisma.profile.update({
          where: { id },
          data: {
            ...rest,
          },
        });
      },
    });

    t.field('deleteProfile', {
      type: NexusProfile,
      args: {
        profileId: nonNull(intArg()),
      },
      resolve: async (_, { profileId }, ctx) => {
        // Fetch the profile and its associated crates
        const profileToDelete = await ctx.prisma.profile.findUnique({
          where: { id: profileId },
          include: {
            followers: true,
            following: true,
            crates: {
              include: {
                albums: {
                  include: {
                    tags: true,
                  },
                },
                labels: true,
                favoritedBy: true,
              },
            },
            favorites: true,
            socialLinks: true,
            followRequestsSent: true,
            followRequestsReceived: true,
            recommendations: true,
          },
        });

        const deletedProfileRecord = JSON.parse(
          JSON.stringify({
            id: profileToDelete.id,
            favorites: [...profileToDelete.favorites],
            crates: JSON.parse(JSON.stringify([...profileToDelete.crates])),
            followers: [...profileToDelete.followers],
            following: [...profileToDelete.following],
          }),
        );

        // let deletedProfileRecord = {
        //   id: profileToDelete.id,
        //   userId: profileToDelete.userId,
        //   username: profileToDelete.username,
        //   isPrivate: profileToDelete.isPrivate,
        //   bio: profileToDelete.bio,
        //   image: profileToDelete.image,
        //   createdAt: profileToDelete.createdAt,
        //   updatedAt: profileToDelete.updatedAt,
        //   searchAndSelectCount: profileToDelete.searchAndSelectCount,
        //   user: profileToDelete.user,
        //   followers: [],
        //   following: [],
        //   crates: [],
        //   favorites: [],
        //   socialLinks: [],
        //   followRequestsSent: [],
        //   followRequestsReceived: [],
        //   recommendations: [],
        // };

        // Loop through the crates and delete them + all CrateAlbums associated to them
        for (const crate of profileToDelete.crates) {
          // // Push the crate data to the deletedProfileRecord
          // deletedProfileRecord.crates.push({
          //   id: crate.id,
          //   labels: crate.labels.map(label => ({ id: label.id })),
          //   albums: crate.albums.map(album => ({
          //     id: album.id,
          //     tags: album.tags.map(tag => ({ id: tag.id })),
          //   })),
          // });

          // Disconnect labels from the crate
          for (const label of crate.labels) {
            await ctx.prisma.label.update({
              where: {
                id: label.id,
              },
              data: {
                crates: {
                  disconnect: { id: crate.id },
                },
              },
            });
          }

          // Disconnect crate to be deleted that is favoritedBy other profiles
          for (const profile of crate.favoritedBy) {
            await ctx.prisma.profile.update({
              where: { id: profile.id },
              data: {
                favorites: {
                  disconnect: { id: crate.id },
                },
              },
            });
          }
          // Delete the crateAlbums
          for (const album of crate.albums) {
            // First disconnect any tags on the album
            for (const tag of album.tags) {
              await ctx.prisma.tag.update({
                where: { id: tag.id },
                data: {
                  disconnect: {
                    crateAlbum: { id: album.id },
                  },
                },
              });
            }

            await ctx.prisma.crateAlbum.delete({ where: { id: album.id } });
          }
          // Delete crate
          await ctx.prisma.crate.delete({ where: { id: crate.id } });
        }

        // Loop through the followers and following and delete them
        for (const follow of [...profileToDelete.followers, ...profileToDelete.following]) {
          //   // Push the follow data to the deletedProfileRecord
          //   if (profileToDelete.followers.includes(follow)) {
          //     deletedProfileRecord.followers.push({ id: follow.id });
          //   } else {
          //     deletedProfileRecord.following.push({ id: follow.id });
          //   }
          await ctx.prisma.follow.delete({ where: { id: follow.id } });
        }

        // Loop through the social links and delete them
        for (const socialLink of profileToDelete.socialLinks) {
          await ctx.prisma.socialLink.delete({ where: { id: socialLink.id } });
        }

        // Loop through the follow requests sent and received and delete them
        for (const followRequest of [
          ...profileToDelete.followRequestsSent,
          ...profileToDelete.followRequestsReceived,
        ]) {
          await ctx.prisma.followRequest.delete({ where: { id: followRequest.id } });
        }

        // Loop through the recommendations and delete them
        for (const recommendation of profileToDelete.recommendations) {
          await ctx.prisma.recommendation.delete({ where: { id: recommendation.id } });
        }

        // // Push the favorites data to the deletedProfileRecord
        // deletedProfileRecord.favorites = profileToDelete.favorites.map(favorite => ({ id: favorite.id }));

        // Delete the profile and all related records
        const deletedProfile = await ctx.prisma.profile.delete({
          where: { id: profileId },
        });

        return deletedProfileRecord;
      },
    });
  },
});

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('acceptUserAgreement', {
      type: NexusUser,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        return ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            acceptedUserAgreement: true,
          },
        });
      },
    });

    t.field('updateLastLoginProfile', {
      type: NexusUser,
      args: {
        userId: nonNull(intArg()),
        profileId: nonNull(intArg()),
      },
      resolve: async (_, { userId, profileId }, ctx) => {
        return ctx.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            lastLoginProfile: profileId,
          },
        });
      },
    });

    t.field('deleteUser', {
      type: NexusUser,
      args: {
        userId: nonNull(intArg()),
      },
      resolve: async (_, { userId }, ctx) => {
        // First, find and delete all NotificationSettings associated with the user
        await ctx.prisma.notificationSettings.deleteMany({
          where: {
            userId: userId,
          },
        });

        // Then, delete the user
        return ctx.prisma.user.delete({
          where: {
            id: userId,
          },
        });
      },
    });
  },
});

export const NotificationSettingsMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateNotificationSettings', {
      type: NexusNotificationSettings,
      args: {
        input: nonNull(NotificationSettingsInput),
      },
      resolve: async (_, { input }, ctx) => {
        const {
          userId,
          showOwnNewFollowers,
          showOwnNewFavorites,
          showFollowingNewFollows,
          showFollowingNewFavorites,
          showFollowingNewCrates,
        } = input;

        // Update profile
        return ctx.prisma.notificationSettings.update({
          where: { userId },
          data: {
            showOwnNewFollowers,
            showOwnNewFavorites,
            showFollowingNewFollows,
            showFollowingNewFavorites,
            showFollowingNewCrates,
          },
        });
      },
    });
  },
});

export const NotificationMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNotification', {
      type: NexusNotification,
      args: {
        receiver: nonNull(intArg()),
        type: nonNull(stringArg()),
        actionOwner: nonNull(intArg()),
        notificationRef: nonNull(intArg()),
      },
      resolve: async (_, { receiver, type, actionOwner, notificationRef }, ctx) => {
        if (type === 'newCrate' || type === 'newFavorite') {
          return await ctx.prisma.notification.create({
            data: {
              receiver,
              type,
              actionOwner,
              connectedCrate: {
                connect: {
                  id: notificationRef,
                },
              },
            },
          });
        } else if (type === 'newFollow') {
          return await ctx.prisma.notification.create({
            data: {
              receiver,
              type,
              actionOwner,
              connectedFollow: {
                connect: {
                  id: notificationRef,
                },
              },
            },
          });
        }
      },
    });
  },
});

export const RecommendationMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('markRecommendationSeen', {
      type: NexusRecommendation,
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
