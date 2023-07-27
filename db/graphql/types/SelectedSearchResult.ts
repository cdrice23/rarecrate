import { objectType } from 'nexus';

export const SelectedSearchResult = objectType({
  name: 'SelectedSearchResult',
  definition(t) {
    t.int('id');
    t.string('searchTerm');
    t.string('searchResult');
    t.string('resultType');
    t.int('selectedId');
  },
});
