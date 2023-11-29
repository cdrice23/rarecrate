import { objectType, inputObjectType, nonNull, intArg, extendType } from 'nexus';
import { User as PrismaUser, NotificationSettings as PrismaNotificationSettings } from 'nexus-prisma';
import { Profile } from './Profile';

export const User = objectType({
  name: PrismaUser.$name,
  definition(t) {
    t.field(PrismaUser.id.name, {
      type: PrismaUser.id.type,
    });
    t.field(PrismaUser.email.name, {
      type: PrismaUser.email.type,
    });
    t.field(PrismaUser.emailVerified.name, {
      type: PrismaUser.emailVerified.type,
    });
    t.field(PrismaUser.role.name, {
      type: PrismaUser.role.type,
    });
    t.field(PrismaUser.acceptedUserAgreement.name, {
      type: PrismaUser.acceptedUserAgreement.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
    });
    t.field(PrismaUser.profiles.name, {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.user
          .findUnique({
            where: { id: parent.id },
          })
          .profiles();
      },
    });
    t.field(PrismaUser.lastLoginProfile.name, {
      type: PrismaUser.lastLoginProfile.type,
    });
  },
});

export const NotificationSettings = objectType({
  name: PrismaNotificationSettings.$name,
  definition(t) {
    t.field(PrismaNotificationSettings.id.name, {
      type: PrismaNotificationSettings.id.type,
    });
    t.field(PrismaNotificationSettings.user.name, {
      type: User,
    });
    t.field(PrismaNotificationSettings.userId.name, {
      type: PrismaNotificationSettings.userId.type,
    });
    t.field(PrismaNotificationSettings.showOwnNewFollowers.name, {
      type: PrismaNotificationSettings.showOwnNewFollowers.type,
    });
    t.field(PrismaNotificationSettings.showOwnNewFavorites.name, {
      type: PrismaNotificationSettings.showOwnNewFavorites.type,
    });
    t.field(PrismaNotificationSettings.showFollowingNewFollows.name, {
      type: PrismaNotificationSettings.showFollowingNewFollows.type,
    });
    t.field(PrismaNotificationSettings.showFollowingNewCrates.name, {
      type: PrismaNotificationSettings.showFollowingNewCrates.type,
    });
    t.field(PrismaNotificationSettings.showFollowingNewFavorites.name, {
      type: PrismaNotificationSettings.showFollowingNewFavorites.type,
    });
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

export const UserMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('acceptUserAgreement', {
      type: User,
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
      type: User,
      args: {
        userId: nonNull(intArg()),
        profileId: intArg(),
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
      type: User,
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
      type: NotificationSettings,
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

export const NotificationSettingsQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getNotificationSettingsByUser', {
      type: NotificationSettings,
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
