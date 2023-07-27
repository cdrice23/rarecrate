import { objectType } from 'nexus';

export const Genre = objectType({
  name: 'Genre',
  definition(t) {
    t.int('id');
    t.string('name');
    t.list.field('albums', {
      type: 'Album',
    });
    t.list.field('subgenres', {
      type: 'Subgenre',
    });
  },
});
