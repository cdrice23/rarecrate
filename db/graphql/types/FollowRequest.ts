import { objectType } from 'nexus';

export const FollowRequest = objectType({
  name: 'FollowRequest',
  definition(t) {
    t.int('id');
    t.field('sender', {
      type: 'Profile',
    });
    t.int('senderId');
    t.field('receiver', {
      type: 'Profile',
    });
    t.int('receiverId');
    t.string('requestStatus');
    t.field('sentAt', {
      type: 'DateTime',
    });
  },
});
