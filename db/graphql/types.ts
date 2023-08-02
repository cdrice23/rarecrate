// import { objectType } from 'nexus';

// export const Album = objectType({
//   name: 'Album',
//   definition(t) {
//     t.int('id');
//     t.int('discogsMasterId');
//     t.string('title');
//     t.string('artist');
//     t.string('label');
//     t.nullable.int('releaseYear');
//     t.list.field('genres', {
//       type: 'Genre',
//     });
//     t.list.field('subgenres', {
//       type: 'Subgenre',
//     });
//     t.string('imageUrl');
//     t.list.field('crates', {
//       type: 'CrateAlbum',
//     });
//     t.list.field('tracklist', {
//       type: 'TracklistItem',
//     });
//     t.int('searchAndSelectCount');
//   },
// });

// export const Crate = objectType({
//   name: 'Crate',
//   definition(t) {
//     t.int('id');
//     t.string('title');
//     t.nullable.string('description');
//     t.field('creator', {
//       type: 'Profile',
//     });
//     t.int('creatorId');
//     t.list.field('favoritedBy', {
//       type: 'Profile',
//     });
//     t.list.field('labels', {
//       type: 'Label',
//     });
//     t.field('createdAt', {
//       type: 'DateTime',
//     });
//     t.field('updatedAt', {
//       type: 'DateTime',
//     });
//     t.boolean('isRanked');
//     t.list.field('albums', {
//       type: 'CrateAlbum',
//     });
//     t.int('searchAndSelectCount');
//     t.list.field('recommendedIn', {
//       type: 'Recommendation',
//     });
//   },
// });

// export const CrateAlbum = objectType({
//   name: 'CrateAlbum',
//   definition(t) {
//     t.int('id');
//     t.field('crate', {
//       type: 'Crate',
//     });
//     t.int('crateId');
//     t.field('album', {
//       type: 'Album',
//     });
//     t.int('albumId');
//     t.nullable.int('rank');
//     t.list.field('tags', {
//       type: 'Tag',
//     });
//   },
// });

// export const CronJob = objectType({
//   name: 'CronJob',
//   definition(t) {
//     t.int('id');
//     t.string('scriptName');
//     t.string('path');
//     t.list.field('runs', {
//       type: 'CronRun',
//     });
//   },
// });

// export const CronRun = objectType({
//   name: 'CronRun',
//   definition(t) {
//     t.int('id');
//     t.field('createdAt', {
//       type: 'DateTime',
//     });
//     t.nullable.field('completedAt', {
//       type: 'DateTime',
//     });
//     t.nullable.string('lastProcessedLabel');
//     t.field('cronJob', {
//       type: 'CronJob',
//     });
//     t.int('cronJobId');
//   },
// });

// export const Follow = objectType({
//   name: 'Follow',
//   definition(t) {
//     t.int('id');
//     t.field('follower', {
//       type: 'Profile',
//     });
//     t.int('followerId');
//     t.field('following', {
//       type: 'Profile',
//     });
//     t.int('followingId');
//   },
// });

// export const FollowRequest = objectType({
//   name: 'FollowRequest',
//   definition(t) {
//     t.int('id');
//     t.field('sender', {
//       type: 'Profile',
//     });
//     t.int('senderId');
//     t.field('receiver', {
//       type: 'Profile',
//     });
//     t.int('receiverId');
//     t.string('requestStatus');
//     t.field('sentAt', {
//       type: 'DateTime',
//     });
//   },
// });

// export const Genre = objectType({
//   name: 'Genre',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('albums', {
//       type: 'Album',
//     });
//     t.list.field('subgenres', {
//       type: 'Subgenre',
//     });
//   },
// });

// export const Label = objectType({
//   name: 'Label',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.boolean('isStandard');
//     t.list.field('crates', {
//       type: 'Crate',
//     });
//     t.int('searchAndSelectCount');
//   },
// });

// export const Profile = objectType({
//   name: 'Profile',
//   definition(t) {
//     t.int('id');
//     t.field('user', {
//       type: 'User',
//     });
//     t.int('userId');
//     t.string('username');
//     t.boolean('isPrivate');
//     t.nullable.string('bio');
//     t.nullable.string('image');
//     t.list.field('followers', {
//       type: 'Follow',
//     });
//     t.list.field('following', {
//       type: 'Follow',
//     });
//     t.list.field('crates', {
//       type: 'Crate',
//     });
//     t.list.field('favorites', {
//       type: 'Crate',
//     });
//     t.list.field('socialLinks', {
//       type: 'SocialLink',
//     });
//     t.list.field('followRequestsSent', {
//       type: 'FollowRequest',
//     });
//     t.list.field('followRequestsReceived', {
//       type: 'FollowRequest',
//     });
//     t.field('createdAt', {
//       type: 'DateTime',
//     });
//     t.field('updatedAt', {
//       type: 'DateTime',
//     });
//     t.int('searchAndSelectCount');
//     t.list.field('recommendations', {
//       type: 'Recommendation',
//     });
//   },
// });

// export const Recommendation = objectType({
//   name: 'Recommendation',
//   definition(t) {
//     t.int('id');
//     t.field('profile', {
//       type: 'Profile',
//     });
//     t.int('profileId');
//     t.field('crate', {
//       type: 'Crate',
//     });
//     t.int('crateId');
//     t.boolean('seen');
//     t.field('createdAt', {
//       type: 'DateTime',
//     });
//     t.field('updatedAt', {
//       type: 'DateTime',
//     });
//   },
// });

// export const SelectedSearchResult = objectType({
//   name: 'SelectedSearchResult',
//   definition(t) {
//     t.int('id');
//     t.string('searchTerm');
//     t.string('searchResult');
//     t.string('resultType');
//     t.int('selectedId');
//   },
// });

// export const SocialLink = objectType({
//   name: 'SocialLink',
//   definition(t) {
//     t.int('id');
//     t.string('platform');
//     t.string('username');
//     t.field('profile', {
//       type: 'Profile',
//     });
//     t.int('profileId');
//   },
// });

// export const Subgenre = objectType({
//   name: 'Subgenre',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('albums', {
//       type: 'Album',
//     });
//     t.field('parentGenre', {
//       type: 'Genre',
//     });
//     t.int('parentGenreId');
//   },
// });

// export const Tag = objectType({
//   name: 'Tag',
//   definition(t) {
//     t.int('id');
//     t.string('name');
//     t.list.field('crateAlbum', {
//       type: 'CrateAlbum',
//     });
//     t.int('searchAndSelectCount');
//   },
// });

// export const TracklistItem = objectType({
//   name: 'TracklistItem',
//   definition(t) {
//     t.int('id');
//     t.string('title');
//     t.int('order');
//     t.field('album', {
//       type: 'Album',
//     });
//     t.int('albumId');
//   },
// });

// export const User = objectType({
//   name: 'User',
//   definition(t) {
//     t.int('id');
//     t.nullable.string('email');
//     t.nullable.boolean('emailVerified');
//     t.string('role');
//     t.field('createdAt', { type: 'DateTime' });
//     t.field('updatedAt', { type: 'DateTime' });
//     t.list.field('profiles', {
//       type: 'Profile',
//     });
//   },
// });

import { objectType } from 'nexus';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const Album = objectType({
  name: 'Album',
  definition(t) {
    t.int('id');
    t.int('discogsMasterId');
    t.string('title');
    t.string('artist');
    t.string('label');
    t.nullable.int('releaseYear');
    t.list.field('genres', {
      type: 'Genre',
      resolve: (parent, _, context) => {
        return context.prisma.album.findUnique({ where: { id: parent.id } }).genres();
      },
    });
    t.list.field('subgenres', {
      type: 'Subgenre',
      resolve: (parent, _, context) => {
        return context.prisma.album.findUnique({ where: { id: parent.id } }).subgenres();
      },
    });
    t.string('imageUrl');
    t.list.field('crates', {
      type: 'CrateAlbum',
      resolve: (parent, _, context) => {
        return context.prisma.album.findUnique({ where: { id: parent.id } }).crates();
      },
    });
    t.list.field('tracklist', {
      // Similar to genres
      type: 'TracklistItem',
      resolve: (parent, _, context) => {
        return context.prisma.album.findUnique({ where: { id: parent.id } }).tracklist();
      },
    });
    t.int('searchAndSelectCount');
  },
});

export const Crate = objectType({
  name: 'Crate',
  definition(t) {
    t.int('id');
    t.string('title');
    t.nullable.string('description');
    t.field('creator', {
      type: 'Profile',
      resolve: (parent, _, context) => {
        return context.prisma.crate.findUnique({ where: { id: parent.id } }).creator();
      },
    });
    t.int('creatorId');
    t.list.field('favoritedBy', {
      type: 'Profile',
      resolve: (parent, _, context) => {
        return context.prisma.crate.findUnique({ where: { id: parent.id } }).favoritedBy();
      },
    });
  },
});

export const CrateAlbum = objectType({
  name: 'CrateAlbum',
  definition(t) {
    t.int('id');
    t.field('album', {
      type: 'Album',
      resolve: (parent, _, context) => {
        return context.prisma.crateAlbum.findUnique({ where: { id: parent.id } }).album();
      },
    });
    t.int('albumId');
    t.field('crate', {
      type: 'Crate',
      resolve: (parent, _, context) => {
        return context.prisma.crateAlbum.findUnique({ where: { id: parent.id } }).crate();
      },
    });
    t.int('crateId');
    t.int('position');
  },
});

export const CronJob = objectType({
  name: 'CronJob',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('schedule');
    t.boolean('isActive');
    t.boolean('isRunning');
    t.nullable.string('lastRun');
    t.nullable.string('nextRun');
  },
});

export const Genre = objectType({
  name: 'Genre',
  definition(t) {
    t.int('id');
    t.string('name');
    t.list.field('albums', {
      type: 'Album',
      resolve: (parent, _, context) => {
        return context.prisma.genre.findUnique({ where: { id: parent.id } }).albums();
      },
    });
  },
});

export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('email');
    t.string('image');
    t.field('user', {
      type: 'User',
      resolve: (parent, _, context) => {
        return context.prisma.profile.findUnique({ where: { id: parent.id } }).user();
      },
    });
    t.int('userId');
    t.list.field('crates', {
      type: 'Crate',
      resolve: (parent, _, context) => {
        return context.prisma.profile.findUnique({ where: { id: parent.id } }).crates();
      },
    });
    t.list.field('favorites', {
      type: 'Crate',
      resolve: (parent, _, context) => {
        return context.prisma.profile.findUnique({ where: { id: parent.id } }).favorites();
      },
    });
  },
});

export const Subgenre = objectType({
  name: 'Subgenre',
  definition(t) {
    t.int('id');
    t.string('name');
    t.list.field('albums', {
      type: 'Album',
      resolve: (parent, _, context) => {
        return context.prisma.subgenre.findUnique({ where: { id: parent.id } }).albums();
      },
    });
  },
});

export const TracklistItem = objectType({
  name: 'TracklistItem',
  definition(t) {
    t.int('id');
    t.string('title');
    t.string('duration');
    t.field('album', {
      type: 'Album',
      resolve: (parent, _, context) => {
        return context.prisma.tracklistItem.findUnique({ where: { id: parent.id } }).album();
      },
    });
    t.int('albumId');
    t.int('position');
  },
});

export const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id');
    t.string('auth0Id');
    t.field('profile', {
      type: 'Profile',
      resolve: (parent, _, context) => {
        return context.prisma.user.findUnique({ where: { id: parent.id } }).profile();
      },
    });
  },
});
