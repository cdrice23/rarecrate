import { nonNull, extendType, inputObjectType, mutationType } from 'nexus';
import {
  Crate as NexusCrate,
  Follow as NexusFollow,
  FollowRequest as NexusFollowRequest,
  FollowAndOrRequest as NexusFollowAndOrRequest,
} from './nexusTypes';
import { RequestStatusEnum } from './nexusEnums';

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
  },
});
