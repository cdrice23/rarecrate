import { objectType } from 'nexus';

export const Profile = objectType({
  name: 'Profile',
  definition(t) {
    t.int('id');
    t.field('user', {
      type: 'User',
    });
    t.int('userId');
    t.string('username');
    t.boolean('isPrivate');
    t.nullable.string('bio');
    t.nullable.string('image');
    t.list.field('followers', {
      type: 'Follow',
    });
    t.list.field('following', {
      type: 'Follow',
    });
    t.list.field('crates', {
      type: 'Crate',
    });
    t.list.field('favorites', {
      type: 'Crate',
    });
    t.list.field('socialLinks', {
      type: 'SocialLink',
    });
    t.list.field('followRequestsSent', {
      type: 'FollowRequest',
    });
    t.list.field('followRequestsReceived', {
      type: 'FollowRequest',
    });
    t.field('createdAt', {
      type: 'DateTime',
    });
    t.field('updatedAt', {
      type: 'DateTime',
    });
    t.int('searchAndSelectCount');
    t.list.field('recommendations', {
      type: 'Recommendation',
    });
  },
});
