import { useLazyQuery } from '@apollo/client';
import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_LABELS_BY_NAME } from '@/db/graphql/clientOperations/search';

const LabelSearchInput = ({ value }) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_LABELS_BY_NAME);

  return (
    <>
      <PillArrayInput
        name="labels"
        value={value}
        label="Labels"
        itemLabel={'name'}
        listItems={data?.searchLabelsByName ?? []}
        loading={loading}
        searchQuery={searchQuery}
        type="labelArray"
      />
    </>
  );
};

export { LabelSearchInput };
