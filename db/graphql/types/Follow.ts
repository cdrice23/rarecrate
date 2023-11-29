import { objectType, inputObjectType, nonNull, intArg, stringArg, extendType, mutationType } from 'nexus';
import { Follow as PrismaFollow, FollowRequest as PrismaFollowRequest } from 'nexus-prisma';
import { RequestStatusEnum } from './nexusEnums';
import { Profile } from './Profile';

export const Follow = objectType({
  name: PrismaFollow.$name,
  definition(t) {
    t.field(PrismaFollow.id.name, {
      type: PrismaFollow.id.type,
    });
    t.field(PrismaFollow.follower.name, {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile.findUnique({
          where: { id: parent.followerId },
          select: {
            id: true,
            image: true,
            username: true,
          },
        });
      },
    });
    t.field(PrismaFollow.followerId.name, {
      type: PrismaFollow.followerId.type,
    });
    t.field(PrismaFollow.following.name, {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile.findUnique({
          where: { id: parent.followingId },
          select: {
            id: true,
            image: true,
            username: true,
            bio: true,
          },
        });
      },
    });
    t.field(PrismaFollow.followingId.name, {
      type: PrismaFollow.followingId.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
  },
});

export const FollowRequest = objectType({
  name: PrismaFollowRequest.$name,
  definition(t) {
    t.field(PrismaFollowRequest.id.name, {
      type: PrismaFollowRequest.id.type,
    });
    t.field(PrismaFollowRequest.sender.name, {
      type: Profile,
    });
    t.field(PrismaFollowRequest.senderId.name, {
      type: PrismaFollowRequest.senderId.type,
    });
    t.field(PrismaFollowRequest.receiver.name, {
      type: Profile,
    });
    t.field(PrismaFollowRequest.receiverId.name, {
      type: PrismaFollowRequest.receiverId.type,
    });
    t.field(PrismaFollowRequest.requestStatus.name, {
      type: RequestStatusEnum,
    });
    t.nonNull.field('sentAt', {
      type: 'DateTime',
    });
  },
});

export const FollowAndOrRequest = objectType({
  name: 'FollowAndOrRequest',
  definition(t) {
    t.field('follow', { type: Follow });
    t.field('followRequest', { type: FollowRequest });
  },
});

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

export const FollowMutations = mutationType({
  definition(t) {
    t.field('createNewFollowOrRequest', {
      type: FollowAndOrRequest,
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
      type: Follow,
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
      type: FollowRequest,
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
      type: FollowAndOrRequest,
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
      type: FollowAndOrRequest,
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

export const FollowRequestQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('getPendingFollowRequests', {
      type: FollowRequest,
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

export const FollowQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('getProfileFollowers', {
      type: Follow,
      args: {
        username: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { username, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const followers = await ctx.prisma.follow.findMany({
          where: {
            following: {
              username: username,
            },
          },
          include: {
            follower: true,
          },
          skip: skip,
          take: 30,
        });

        return followers;
      },
    });

    t.nonNull.list.field('getProfileFollowing', {
      type: Follow,
      args: {
        username: nonNull(stringArg()),
        currentPage: nonNull(intArg()),
      },
      resolve: async (_, { username, currentPage }, ctx) => {
        const skip = (currentPage - 1) * 30;
        const following = await ctx.prisma.follow.findMany({
          where: {
            follower: {
              username: username,
            },
          },
          include: {
            following: true,
          },
          skip: skip,
          take: 30,
        });

        return following;
      },
    });
  },
});
