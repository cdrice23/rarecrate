import { objectType, nonNull, intArg, stringArg, extendType } from 'nexus';
import { Notification as PrismaNotification } from 'nexus-prisma';
import { Crate } from './Crate';
import { Follow } from './Follow';
import { Profile } from './Profile';

export const Notification = objectType({
  name: PrismaNotification.$name,
  definition(t) {
    t.field(PrismaNotification.id.name, {
      type: PrismaNotification.id.type,
    });
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.field(PrismaNotification.receiver.name, {
      type: PrismaNotification.receiver.type,
    });
    t.field(PrismaNotification.type.name, {
      type: PrismaNotification.type.type,
    });
    t.field(PrismaNotification.actionOwner.name, {
      type: Profile,
      resolve: async (parent: any, _, ctx) => {
        return ctx.prisma.profile.findUnique({
          where: {
            id: parent.actionOwner,
          },
        });
      },
    });
    t.field(PrismaNotification.connectedCrate.name, {
      type: Crate,
      resolve: async (parent: any, _, ctx) => {
        if (parent.crateId) {
          return ctx.prisma.crate.findUnique({
            where: {
              id: parent.crateId,
            },
          });
        }
        return null;
      },
    });
    t.field(PrismaNotification.crateId.name, {
      type: PrismaNotification.crateId.type,
    });
    t.field(PrismaNotification.connectedFollow.name, {
      type: Follow,
      resolve: async (parent: any, _, ctx) => {
        if (parent.followId) {
          return ctx.prisma.follow.findUnique({
            where: {
              id: parent.followId,
            },
            include: {
              follower: true,
              following: true,
            },
          });
        }
        return null;
      },
    });
    t.field(PrismaNotification.followId.name, {
      type: PrismaNotification.followId.type,
    });
  },
});

export const NotificationMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createNotification', {
      type: Notification,
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

export const NotificationQueries = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('getNotificationsByProfile', {
      type: Notification,
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
              if (notification.connectedFollow) {
                const follow = await ctx.prisma.follow.findUnique({ where: { id: notification.connectedFollow.id } });
                if (follow && follow.followingId === profileId) {
                  return notification;
                }
              }
            }

            // Check to return notifications of profile's crates being favorited
            if (notificationSettings.showOwnNewFavorites && notification.type === 'newFavorite') {
              if (notification.connectedCrate) {
                const crate = await ctx.prisma.crate.findUnique({ where: { id: notification.connectedCrate.id } });
                if (crate && crate.creatorId === profileId) {
                  return notification;
                }
              }
            }

            // Check to return notifications of profile's followed profiles when they follow new profiles
            if (notificationSettings.showFollowingNewFollows && notification.type === 'newFollow') {
              if (notification.connectedFollow) {
                const follow = await ctx.prisma.follow.findUnique({ where: { id: notification.connectedFollow.id } });
                if (follow && follow.followingId !== profileId) {
                  return notification;
                }
              }
            }

            // Check to return notifications of profile's followed profiles when they create a new crate
            if (notificationSettings.showFollowingNewCrates && notification.type === 'newCrate') {
              return notification;
            }

            // Check to return notifications of profile's followed profiles when the favorite a new crate
            if (notificationSettings.showFollowingNewFavorites && notification.type === 'newFavorite') {
              if (notification.connectedCrate) {
                const crate = await ctx.prisma.crate.findUnique({ where: { id: notification.connectedCrate.id } });
                if (crate && crate.creatorId !== profileId) {
                  return notification;
                }
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
