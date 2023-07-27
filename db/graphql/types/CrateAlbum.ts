import { objectType } from 'nexus';

export const CrateAlbum = objectType({
  name: 'CrateAlbum',
  definition(t) {
    t.int('id');
    t.field('crate', {
      type: 'Crate',
    });
    t.int('crateId');
    t.field('album', {
      type: 'Album',
    });
    t.int('albumId');
    t.nullable.int('rank');
    t.list.field('tags', {
      type: 'Tag',
    });
  },
});
