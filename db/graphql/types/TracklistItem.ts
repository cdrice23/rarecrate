import { objectType } from 'nexus';

export const TracklistItem = objectType({
  name: 'TracklistItem',
  definition(t) {
    t.int('id');
    t.string('title');
    t.int('order');
    t.field('album', {
      type: 'Album',
    });
    t.int('albumId');
  },
});
