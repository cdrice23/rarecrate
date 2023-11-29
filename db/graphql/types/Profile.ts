import { objectType, inputObjectType, queryType, nonNull, intArg, stringArg, nullable, extendType } from 'nexus';
import { Profile as PrismaProfile, SocialLink as PrismaSocialLink } from 'nexus-prisma';
import { Crate } from './Crate';
import { FollowRequest } from './Follow';
import { Recommendation } from './Recommendation';
import { User } from './User';

export const Profile = objectType({
  name: PrismaProfile.$name,
  definition(t) {
    t.field(PrismaProfile.id.name, {
      type: PrismaProfile.id.type,
    });
    t.field(PrismaProfile.user.name, {
      type: User,
    });
    t.field(PrismaProfile.userId.name, {
      type: PrismaProfile.userId.type,
    });
    t.field(PrismaProfile.username.name, {
      type: PrismaProfile.username.type,
    });
    t.field(PrismaProfile.isPrivate.name, {
      type: PrismaProfile.isPrivate.type,
    });
    t.field(PrismaProfile.bio.name, {
      type: PrismaProfile.bio.type,
    });
    t.field(PrismaProfile.image.name, {
      type: PrismaProfile.image.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
    });
    t.field(PrismaProfile.searchAndSelectCount.name, {
      type: PrismaProfile.searchAndSelectCount.type,
    });
    t.list.field('followers', {
      type: Profile,
      resolve: async (parent: any, _args, ctx) => {
        const profile = await ctx.prisma.profile.findUnique({ where: { id: parent.id } });
        if (!profile) {
          return parent.followers;
        }
        const allProfileFollowers = await ctx.prisma.follow
          .findMany({
            where: { followingId: parent.id },
            select: {
              id: true,
              follower: true,
            },
          })
          .then(follows => follows.map(follow => follow.follower));

        return allProfileFollowers;
      },
    });
    t.list.field('following', {
      type: Profile,
      resolve: async (parent: any, _args, ctx) => {
        const profile = await ctx.prisma.profile.findUnique({ where: { id: parent.id } });

        if (!profile) {
          return parent.following;
        }
        return ctx.prisma.follow
          .findMany({
            where: { followerId: parent.id },
            select: {
              id: true,
              following: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
            },
          })
          .then(follows => follows.map(follow => follow.following));
      },
    });
    t.list.field('crates', {
      type: Crate,
      resolve: async (parent: any, _args, ctx) => {
        const profile = await ctx.prisma.profile.findUnique({ where: { id: parent.id } });

        if (!profile) {
          return parent.crates;
        }
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .crates();
      },
    });
    t.list.field('favorites', {
      type: Crate,
      resolve: async (parent: any, _args, ctx) => {
        const profile = await ctx.prisma.profile.findUnique({ where: { id: parent.id } });

        if (!profile) {
          return parent.favorites;
        }
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .favorites({
            include: {
              creator: {
                select: {
                  id: true,
                  image: true,
                  username: true,
                },
              },
            },
          });
      },
    });
    t.list.field('socialLinks', {
      type: SocialLink,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .socialLinks();
      },
    });
    t.list.field('followRequestsSent', {
      type: FollowRequest,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .followRequestsSent();
      },
    });
    t.list.field('followRequestsReceived', {
      type: FollowRequest,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .followRequestsReceived();
      },
    });
    t.list.field('recommendations', {
      type: Recommendation,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .recommendations();
      },
    });
    t.field(PrismaProfile.searchAndSelectCount.name, {
      type: PrismaProfile.searchAndSelectCount.type,
    });
  },
});

export const SocialLink = objectType({
  name: PrismaSocialLink.$name,
  definition(t) {
    t.field(PrismaSocialLink.id.name, {
      type: PrismaSocialLink.id.type,
    });
    t.field(PrismaSocialLink.platform.name, {
      type: PrismaSocialLink.platform.type,
    });
    t.field(PrismaSocialLink.username.name, {
      type: PrismaSocialLink.username.type,
    });
    t.field(PrismaSocialLink.profile.name, {
      type: Profile,
    });
    t.field(PrismaSocialLink.profileId.name, {
      type: PrismaSocialLink.profileId.type,
    });
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

export const ProfileMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNewProfile', {
      type: Profile,
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
      type: Profile,
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
      type: Profile,
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

        // Loop through the crates and delete them + all CrateAlbums associated to them
        for (const crate of profileToDelete.crates) {
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
                  crateAlbum: {
                    disconnect: {
                      id: album.id,
                    },
                  },
                },
              });
            }

            await ctx.prisma.crateAlbum.delete({ where: { id: album.id } });
          }

          // Delete the recommendations where the crate is the connected crate
          await ctx.prisma.recommendation.deleteMany({
            where: {
              crateId: crate.id,
            },
          });

          // Delete crate
          await ctx.prisma.crate.delete({ where: { id: crate.id } });
        }

        // Loop through the followers and following and delete them
        for (const follow of [...profileToDelete.followers, ...profileToDelete.following]) {
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

        // Remove the profileToDelete from any crates where it appears as favoritedBy
        const cratesToUpdate = await ctx.prisma.crate.findMany({
          where: {
            favoritedBy: {
              some: {
                id: profileId,
              },
            },
          },
        });

        for (const crate of cratesToUpdate) {
          await ctx.prisma.crate.update({
            where: { id: crate.id },
            data: {
              favoritedBy: {
                disconnect: { id: profileId },
              },
            },
          });
        }

        // Delete all notifications where the actionOwner is the deletedProfile
        await ctx.prisma.notification.deleteMany({
          where: {
            actionOwner: profileId,
          },
        });

        // Delete all notifications where the receiver is the deletedProfile
        await ctx.prisma.notification.deleteMany({
          where: {
            receiver: profileId,
          },
        });

        // Loop through the recommendations and delete them
        for (const recommendation of profileToDelete.recommendations) {
          await ctx.prisma.recommendation.delete({ where: { id: recommendation.id } });
        }

        // Delete the profile and all related records
        await ctx.prisma.profile.delete({
          where: { id: profileId },
        });

        return deletedProfileRecord;
      },
    });

    t.field('updateProfilePicUrl', {
      type: Profile,
      args: {
        profileId: nonNull(intArg()),
        url: stringArg(),
      },
      resolve: async (_, { profileId, url }, ctx) => {
        return ctx.prisma.profile.update({
          where: {
            id: profileId,
          },
          data: {
            image: url,
          },
        });
      },
    });
  },
});

export const ProfileQueries = queryType({
  definition(t) {
    t.nonNull.list.nonNull.field('getUsernameById', {
      type: Profile,
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
      type: Profile,
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
      type: Profile,
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
      type: Profile,
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
          skip: skip,
          take: 30,
        });

        return profiles;
      },
    });

    t.nonNull.field('getLastLoginProfile', {
      type: Profile,
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
