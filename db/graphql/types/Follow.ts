import { objectType } from 'nexus';

export const Follow = objectType({
  name: 'Follow',
  definition(t) {
    t.int('id');
    t.field('follower', {
      type: 'Profile',
    });
    t.int('followerId');
    t.field('following', {
      type: 'Profile',
    });
    t.int('followingId');
  },
});
