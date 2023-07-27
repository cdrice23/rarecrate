import { objectType } from 'nexus';

export const CronJob = objectType({
  name: 'CronJob',
  definition(t) {
    t.int('id');
    t.string('scriptName');
    t.string('path');
    t.list.field('runs', {
      type: 'CronRun',
    });
  },
});
