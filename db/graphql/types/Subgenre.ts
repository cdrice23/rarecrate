import { objectType } from 'nexus';

export const Subgenre = objectType({
  name: 'Subgenre',
  definition(t) {
    t.int('id');
    t.string('name');
    t.list.field('albums', {
      type: 'Album',
    });
    t.field('parentGenre', {
      type: 'Genre',
    });
    t.int('parentGenreId');
  },
});
