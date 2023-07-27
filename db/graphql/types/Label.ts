import { objectType } from 'nexus';

export const Label = objectType({
  name: 'Label',
  definition(t) {
    t.int('id');
    t.string('name');
    t.boolean('isStandard');
    t.list.field('crates', {
      type: 'Crate',
    });
    t.int('searchAndSelectCount');
  },
});
