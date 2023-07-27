import { objectType } from 'nexus';

export const Recommendation = objectType({
  name: 'Recommendation',
  definition(t) {
    t.int('id');
    t.field('profile', {
      type: 'Profile',
    });
    t.int('profileId');
    t.field('crate', {
      type: 'Crate',
    });
    t.int('crateId');
    t.boolean('seen');
    t.field('createdAt', {
      type: 'DateTime',
    });
    t.field('updatedAt', {
      type: 'DateTime',
    });
  },
});
