import { objectType } from 'nexus';

export const SocialLink = objectType({
  name: 'SocialLink',
  definition(t) {
    t.int('id');
    t.string('platform');
    t.string('username');
    t.field('profile', {
      type: 'Profile',
    });
    t.int('profileId');
  },
});
