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
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.follow
          .findMany({
            where: { followingId: parent.id },
            select: {
              id: true,
              follower: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
            },
          })
          .then(follows => follows.map(follow => follow.follower));
      },
    });
    t.list.field('following', {
      type: Profile,
      resolve: (parent, _args, ctx) => {
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
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('updatedAt', {
      type: 'DateTime',
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
    t.nonNull.field('createdAt', {
      type: 'DateTime',
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
    t.nonNull.field('sentAt', {
      type: 'DateTime',
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
    t.nonNull.field('createdAt', {
      type: 'DateTime',
    });
    t.nonNull.field('completedAt', {
      type: 'DateTime',
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
  },
});
