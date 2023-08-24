import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_LABELS } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

const TagSearchInput = ({ value, name }) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_LABELS);

  return (
    <>
      <PillArrayInput
        name={name}
        value={value}
        label="Tags"
        itemLabel={'name'}
        listItems={data?.searchLabels ?? []}
        loading={loading}
        searchQuery={searchQuery}
        type="tagArray"
      />
    </>
  );
};

export { TagSearchInput };
