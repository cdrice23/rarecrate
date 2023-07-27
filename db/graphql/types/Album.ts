import { objectType } from 'nexus';

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
    });
    t.list.field('subgenres', {
      type: 'Subgenre',
    });
    t.string('imageUrl');
    t.list.field('crates', {
      type: 'CrateAlbum',
    });
    t.list.field('tracklist', {
      type: 'TracklistItem',
    });
    t.int('searchAndSelectCount');
  },
});
