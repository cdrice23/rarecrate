import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_TAGS } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

const TagSearchInput = ({ value, name }) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_TAGS);

  return (
    <>
      <PillArrayInput
        name={name}
        value={value}
        label="Tags"
        itemLabel={'name'}
        listItems={data?.searchTags ?? []}
        loading={loading}
        searchQuery={searchQuery}
        type="tagArray"
      />
    </>
  );
};

export { TagSearchInput };
