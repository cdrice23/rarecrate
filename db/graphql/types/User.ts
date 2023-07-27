import { objectType } from 'nexus';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.int('id');
    t.nullable.string('email');
    t.nullable.boolean('emailVerified');
    t.string('role');
    t.field('createdAt', { type: 'DateTime' });
    t.field('updatedAt', { type: 'DateTime' });
    t.list.field('profiles', {
      type: 'Profile',
    });
  },
});
