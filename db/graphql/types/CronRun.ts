import { objectType } from 'nexus';

export const CronRun = objectType({
  name: 'CronRun',
  definition(t) {
    t.int('id');
    t.field('createdAt', {
      type: 'DateTime',
    });
    t.nullable.field('completedAt', {
      type: 'DateTime',
    });
    t.nullable.string('lastProcessedLabel');
    t.field('cronJob', {
      type: 'CronJob',
    });
    t.int('cronJobId');
  },
});
