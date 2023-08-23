import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_LABELS } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

const LabelSearchInput = ({ value }) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_LABELS);

  return (
    <>
      <PillArrayInput
        name="labels"
        value={value}
        label="Labels"
        itemLabel={'name'}
        listItems={data?.searchLabels ?? []}
        loading={loading}
        searchQuery={searchQuery}
      />
    </>
  );
};

export { LabelSearchInput };
