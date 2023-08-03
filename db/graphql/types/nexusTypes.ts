// import { objectType } from 'nexus';
// import { Context } from './context';

// export const NAlbum = objectType({
//   name: 'NAlbum',
//   definition(t) {
//     t.int('id');
//     t.int('discogsMasterId');
//     t.string('title');
//     t.string('artist');
//     t.string('label');
//     t.nullable.int('releaseYear');
//     t.list.field('genres', {
//       type: 'NGenre',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album
//           .findUnique({ where: { id: parent.id } })
//           .genres()
//       },
//     });
//     t.list.field('subgenres', {
//       type: 'NSubgenre',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album
//           .findUnique({ where: { id: parent.id } })
//           .subgenres()
//       },
//     });
//     t.string('imageUrl');
//     t.list.field('crates', {
//       type: 'NCrateAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album
//           .findUnique({ where: { id: parent.id } })
//           .crates()
//       },
//     });
//     t.list.field('tracklist', {
//       type: 'NTracklistItem',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album
//           .findUnique({ where: { id: parent.id } })
//           .tracklist()
//       },
//     });
//     t.int('searchAndSelectCount');
//   },
// });

// export const NCrate = objectType({
//   name: 'NCrate',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.string('description');
//     t.field('createdAt', { type: "DateTime" });
//     t.field('updatedAt', { type: "DateTime" });
//     t.int('creatorId');
//     t.field('creator', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.creatorId } });
//       },
//     });
//     t.list.field('albums', {
//       type: 'NCrateAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crateAlbum.findMany({ where: { crateId: parent.id } });
//       },
//     });
//     t.list.field('favoritedBy', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findMany({ where: { favorites: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('labels', {
//       type: 'NLabel',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.label.findMany({ where: { crates: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('recommendations', {
//       type: 'NRecommendation',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.recommendation.findMany({ where: { crateId: parent.id } });
//       },
//     });
//   },
// });

// export const NCrateAlbum = objectType({
//   name: 'NCrateAlbum',
//   definition(t) {
//     t.int('id');
//     t.field('crate', {
//       type: 'NCrate',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crate.findUnique({ where: { id: parent.crateId } });
//       },
//     });
//     t.int('crateId');
//     t.field('album', {
//       type: 'NAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album.findUnique({ where: { id: parent.albumId } });
//       },
//     });
//     t.int('albumId');
//     t.nullable.int('rank');
//     t.list.field('tags', {
//       type: 'NTag',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.tag.findMany({ where: { id: parent.id } });
//       },
//     });
//   },
// });

// export const NCronJob = objectType({
//   name: 'NCronJob',
//   definition(t) {
//     t.int('id');
//     t.string('scriptName');
//     t.string('path');
//     t.list.field('runs', {
//       type: 'NCronRun',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.cronRun.findMany({ where: { cronJobId: parent.id } });
//       },
//     });
//   },
// });

// export const NCronRun = objectType({
//   name: 'NCronRun',
//   definition(t) {
//     t.int('id');
//     t.field('createdAt', { type: 'DateTime' });
//     t.nullable.field('completedAt', { type: 'DateTime' });
//     t.nullable.string('lastProcessedLabel');
//     t.field('cronJob', {
//       type: 'NCronJob',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.cronJob.findUnique({ where: { id: parent.cronJobId } });
//       },
//     });
//     t.int('cronJobId');
//   },
// });

// export const NFollow = objectType({
//   name: 'NFollow',
//   definition(t) {
//     t.int('id');
//     t.field('follower', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.followerId } });
//       },
//     });
//     t.int('followerId');
//     t.field('following', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.followingId } });
//       },
//     });
//     t.int('followingId');
//   },
// });

// export const NFollowRequest = objectType({
//   name: 'NFollowRequest',
//   definition(t) {
//     t.int('id');
//     t.field('sender', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.senderId } });
//       },
//     });
//     t.int('senderId');
//     t.field('receiver', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.receiverId } });
//       },
//     });
//     t.int('receiverId');
//     t.string('requestStatus');
//     t.field('sentAt', { type: 'DateTime' });
//   },
// });

// export const NGenre = objectType({
//   name: 'NGenre',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('albums', {
//       type: 'NAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album.findMany({ where: { genres: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('subgenres', {
//       type: 'NSubgenre',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.subgenre.findMany({ where: { parentGenreId: parent.id } });
//       },
//     });
//   },
// });

// export const NLabel = objectType({
//   name: 'NLabel',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.boolean('isStandard');
//     t.int('searchAndSelectCount');
//     t.list.field('crates', {
//       type: 'NCrate',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crate.findMany({ where: { labels: { some: { id: parent.id } } } });
//       },
//     });
//   },
// });

// export const NProfile = objectType({
//   name: 'NProfile',
//   definition(t) {
//     t.int('id');
//     t.field('user', {
//       type: 'NUser',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.user.findUnique({ where: { id: parent.userId } });
//       },
//     });
//     t.int('userId');
//     t.string('username');
//     t.boolean('isPrivate');
//     t.nullable.string('bio');
//     t.nullable.string('image');
//     t.list.field('followers', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findMany({ where: { following: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('following', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findMany({ where: { followers: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('crates', {
//       type: 'NCrate',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crate.findMany({ where: { creatorId: parent.id } });
//       },
//     });
//     t.list.field('favorites', {
//       type: 'NCrate',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crate.findMany({ where: { favoritedBy: { some: { id: parent.id } } } });
//       },
//     });
//     t.list.field('socialLinks', {
//       type: 'NSocialLink',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.socialLink.findMany({ where: { profileId: parent.id } });
//       },
//     });
//     t.list.field('followRequestsSent', {
//       type: 'NFollowRequest',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.followRequest.findMany({ where: { senderId: parent.id } });
//       },
//     });
//     t.list.field('followRequestsReceived', {
//       type: 'NFollowRequest',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.followRequest.findMany({ where: { receiverId: parent.id } });
//       },
//     });
//     t.field('createdAt', { type: "DateTime" });
//     t.field('updatedAt', { type: "DateTime" });
//     t.int('searchAndSelectCount');
//     t.list.field('recommendations', {
//       type: 'NRecommendation',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.recommendation.findMany({ where: { profileId: parent.id } });
//       },
//     });
//   },
// });

// export const NRecommendation = objectType({
//   name: 'NRecommendation',
//   definition(t) {
//     t.int('id');
//     t.field('profile', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.profileId } });
//       },
//     });
//     t.int('profileId');
//     t.field('crate', {
//       type: 'NCrate',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crate.findUnique({ where: { id: parent.crateId } });
//       },
//     });
//     t.int('crateId');
//     t.boolean('seen');
//     t.field('createdAt', { type: 'DateTime' });
//     t.field('updatedAt', { type: 'DateTime' });
//   },
// });

// export const NSelectedSearchResult = objectType({
//   name: 'NSelectedSearchResult',
//   definition(t) {
//     t.int('id');
//     t.string('searchTerm');
//     t.string('searchResult');
//     t.string('resultType');
//     t.int('selectedId');
//   },
// });

// export const NSocialLink = objectType({
//   name: 'NSocialLink',
//   definition(t) {
//     t.int('id');
//     t.string('platform');
//     t.string('username');
//     t.field('profile', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findUnique({ where: { id: parent.profileId } });
//       },
//     });
//     t.int('profileId');
//   },
// });

// export const NSubgenre = objectType({
//   name: 'NSubgenre',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('albums', {
//       type: 'NAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album.findMany({ where: { subgenres: { some: { id: parent.id } } } });
//       },
//     });
//     t.field('parentGenre', {
//       type: 'NGenre',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.genre.findUnique({ where: { id: parent.parentGenreId } });
//       },
//     });
//     t.int('parentGenreId');
//   },
// });

// export const NTag = objectType({
//   name: 'NTag',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('crateAlbum', {
//       type: 'NCrateAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.crateAlbum.findMany({ where: { id: parent.id } });
//       },
//     });
//     t.int('searchAndSelectCount');
//   },
// });

// export const NTracklistItem = objectType({
//   name: 'NTracklistItem',
//   definition(t) {
//     t.int('id');
//     t.string('title');
//     t.int('order');
//     t.field('album', {
//       type: 'NAlbum',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.album.findUnique({ where: { id: parent.albumId } });
//       },
//     });
//     t.int('albumId');
//   },
// });

// export const NUser = objectType({
//   name: 'NUser',
//   definition(t) {
//     t.int('id');
//     t.string('email');
//     t.boolean('emailVerified');
//     t.string('role');
//     t.field('createdAt', { type: 'DateTime' });
//     t.field('updatedAt', { type: 'DateTime' });
//     t.list.field('profiles', {
//       type: 'NProfile',
//       resolve: (parent, _, context: Context) => {
//         return context.prisma.profile.findMany({ where: { userId: parent.id } });
//       },
//     });
//   },
// });

import { objectType } from 'nexus';
import {
  User as PrismaUser,
  Profile as PrismaProfile,
  Crate as PrismaCrate,
  Follow as PrismaFollow,
  SocialLink as PrismaSocialLink,
  FollowRequest as PrismaFollowRequest,
  Album as PrismaAlbum,
  Genre as PrismaGenre,
  Subgenre as PrismaSubgenre,
  TracklistItem as PrismaTracklistItem,
  CrateAlbum as PrismaCrateAlbum,
  Label as PrismaLabel,
  Tag as PrismaTag,
  CronJob as PrismaCronJob,
  CronRun as PrismaCronRun,
  SelectedSearchResult as PrismaSelectedSearchResult,
  Recommendation as PrismaRecommendation,
} from 'nexus-prisma';
import { GraphQLDateTime } from 'graphql-iso-date';

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
    t.field(PrismaUser.createdAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.createdAt,
    });
    t.field(PrismaUser.updatedAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.updatedAt,
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
  },
});

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
    t.field(PrismaProfile.createdAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.createdAt,
    });
    t.field(PrismaProfile.updatedAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.updatedAt,
    });
    t.field(PrismaProfile.searchAndSelectCount.name, {
      type: PrismaProfile.searchAndSelectCount.type,
    });
    t.list.field('followers', {
      type: Follow,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .followers();
      },
    });
    t.list.field('following', {
      type: Follow,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .following();
      },
    });
    t.list.field('crates', {
      type: Crate,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .crates();
      },
    });
    t.list.field('favorites', {
      type: Crate,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.profile
          .findUnique({
            where: { id: parent.id },
          })
          .favorites();
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
  },
});

export const Crate = objectType({
  name: PrismaCrate.$name,
  definition(t) {
    t.field(PrismaCrate.id.name, {
      type: PrismaCrate.id.type,
    });
    t.field(PrismaCrate.title.name, {
      type: PrismaCrate.title.type,
    });
    t.field(PrismaCrate.description.name, {
      type: PrismaCrate.description.type,
    });
    t.field(PrismaCrate.creator.name, {
      type: Profile,
    });
    t.field(PrismaCrate.creatorId.name, {
      type: PrismaCrate.creatorId.type,
    });
    t.field(PrismaCrate.createdAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.createdAt,
    });
    t.field(PrismaCrate.updatedAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.updatedAt,
    });
    t.field(PrismaCrate.isRanked.name, {
      type: PrismaCrate.isRanked.type,
    });
    t.field(PrismaCrate.searchAndSelectCount.name, {
      type: PrismaCrate.searchAndSelectCount.type,
    });
    t.list.field('favoritedBy', {
      type: Profile,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .favoritedBy();
      },
    });
    t.list.field('labels', {
      type: Label,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .labels();
      },
    });
    t.list.field('albums', {
      type: CrateAlbum,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .albums();
      },
    });
    t.list.field('recommendedIn', {
      type: Recommendation,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.crate
          .findUnique({
            where: { id: parent.id },
          })
          .recommendedIn();
      },
    });
  },
});

export const Follow = objectType({
  name: PrismaFollow.$name,
  definition(t) {
    t.field(PrismaFollow.id.name, {
      type: PrismaFollow.id.type,
    });
    t.field(PrismaFollow.follower.name, {
      type: Profile,
    });
    t.field(PrismaFollow.followerId.name, {
      type: PrismaFollow.followerId.type,
    });
    t.field(PrismaFollow.following.name, {
      type: Profile,
    });
    t.field(PrismaFollow.followingId.name, {
      type: PrismaFollow.followingId.type,
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
      type: PrismaFollowRequest.requestStatus.type,
    });
    t.field(PrismaFollowRequest.sentAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.sentAt,
    });
  },
});

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
    t.field(PrismaAlbum.genres.name, {
      type: Genre,
    });
    t.field(PrismaAlbum.subgenres.name, {
      type: Subgenre,
    });
    t.field(PrismaAlbum.imageUrl.name, {
      type: PrismaAlbum.imageUrl.type,
    });
    t.field(PrismaAlbum.crates.name, {
      type: CrateAlbum,
    });
    t.field(PrismaAlbum.tracklist.name, {
      type: TracklistItem,
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
    });
    t.field(PrismaCrateAlbum.albumId.name, {
      type: PrismaCrateAlbum.albumId.type,
    });
    t.field(PrismaCrateAlbum.rank.name, {
      type: PrismaCrateAlbum.rank.type,
    });
    t.list.field(PrismaCrateAlbum.tags.name, {
      type: Tag,
    });
  },
});

export const Label = objectType({
  name: PrismaLabel.$name,
  definition(t) {
    t.field(PrismaLabel.id.name, {
      type: PrismaLabel.id.type,
    });
    t.field(PrismaLabel.name.name, {
      type: PrismaLabel.name.type,
    });
    t.field(PrismaLabel.isStandard.name, {
      type: PrismaLabel.isStandard.type,
    });
    t.list.field(PrismaLabel.crates.name, {
      type: Crate,
    });
    t.field(PrismaLabel.searchAndSelectCount.name, {
      type: PrismaLabel.searchAndSelectCount.type,
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

export const CronJob = objectType({
  name: PrismaCronJob.$name,
  definition(t) {
    t.field(PrismaCronJob.id.name, {
      type: PrismaCronJob.id.type,
    });
    t.field(PrismaCronJob.scriptName.name, {
      type: PrismaCronJob.scriptName.type,
    });
    t.field(PrismaCronJob.path.name, {
      type: PrismaCronJob.path.type,
    });
    t.list.field(PrismaCronJob.runs.name, {
      type: CronRun,
    });
  },
});

export const CronRun = objectType({
  name: PrismaCronRun.$name,
  definition(t) {
    t.field(PrismaCronRun.id.name, {
      type: PrismaCronRun.id.type,
    });
    t.field(PrismaCronRun.createdAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.createdAt,
    });
    t.field(PrismaCronRun.completedAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.completedAt,
    });
    t.field(PrismaCronRun.lastProcessedLabel.name, {
      type: PrismaCronRun.lastProcessedLabel.type,
    });
    t.field(PrismaCronRun.cronJob.name, {
      type: CronJob,
    });
    t.field(PrismaCronRun.cronJobId.name, {
      type: PrismaCronRun.cronJobId.type,
    });
  },
});

export const SelectedSearchResult = objectType({
  name: PrismaSelectedSearchResult.$name,
  definition(t) {
    t.field(PrismaSelectedSearchResult.id.name, {
      type: PrismaSelectedSearchResult.id.type,
    });
    t.field(PrismaSelectedSearchResult.searchTerm.name, {
      type: PrismaSelectedSearchResult.searchTerm.type,
    });
    t.field(PrismaSelectedSearchResult.searchResult.name, {
      type: PrismaSelectedSearchResult.searchResult.type,
    });
    t.field(PrismaSelectedSearchResult.resultType.name, {
      type: PrismaSelectedSearchResult.resultType.type,
    });
    t.field(PrismaSelectedSearchResult.selectedId.name, {
      type: PrismaSelectedSearchResult.selectedId.type,
    });
  },
});

export const Recommendation = objectType({
  name: PrismaRecommendation.$name,
  definition(t) {
    t.field(PrismaRecommendation.id.name, {
      type: PrismaRecommendation.id.type,
    });
    t.field(PrismaRecommendation.profile.name, {
      type: Profile,
    });
    t.field(PrismaRecommendation.profileId.name, {
      type: PrismaRecommendation.profileId.type,
    });
    t.field(PrismaRecommendation.crate.name, {
      type: Crate,
    });
    t.field(PrismaRecommendation.crateId.name, {
      type: PrismaRecommendation.crateId.type,
    });
    t.field(PrismaRecommendation.seen.name, {
      type: PrismaRecommendation.seen.type,
    });
    t.field(PrismaRecommendation.createdAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.createdAt,
    });
    t.field(PrismaRecommendation.updatedAt.name, {
      type: GraphQLDateTime,
      resolve: parent => parent.updatedAt,
    });
  },
});
