import { objectType } from 'nexus';

export const Crate = objectType({
  name: 'Crate',
  definition(t) {
    t.int('id');
    t.string('title');
    t.nullable.string('description');
    t.field('creator', {
      type: 'Profile',
    });
    t.int('creatorId');
    t.list.field('favoritedBy', {
      type: 'Profile',
    });
    t.list.field('labels', {
      type: 'Label',
    });
    t.field('createdAt', {
      type: 'DateTime',
    });
    t.field('updatedAt', {
      type: 'DateTime',
    });
    t.boolean('isRanked');
    t.list.field('albums', {
      type: 'CrateAlbum',
    });
    t.int('searchAndSelectCount');
    t.list.field('recommendedIn', {
      type: 'Recommendation',
    });
  },
});
