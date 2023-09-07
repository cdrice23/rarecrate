import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_TAGS_BY_NAME } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

const TagSearchInput = ({ value, name }) => {
  const [searchQuery, { loading, data }] = useLazyQuery(SEARCH_TAGS_BY_NAME);

  return (
    <>
      <PillArrayInput
        name={name}
        value={value}
        label="Tags"
        itemLabel={'name'}
        listItems={data?.searchTagsByName ?? []}
        loading={loading}
        searchQuery={searchQuery}
        type="tagArray"
      />
    </>
  );
};

export { TagSearchInput };
