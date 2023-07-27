import { objectType } from 'nexus';

export const Tag = objectType({
  name: 'Tag',
  definition(t) {
    t.int('id');
    t.string('name');
    t.list.field('crateAlbum', {
      type: 'CrateAlbum',
    });
    t.int('searchAndSelectCount');
  },
});
