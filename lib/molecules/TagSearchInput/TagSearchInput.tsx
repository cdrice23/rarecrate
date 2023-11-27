import { useLazyQuery } from '@apollo/client';
import { PillArrayInput } from '@/lib/atoms/PillArrayInput/PillArrayInput';
import { SEARCH_TAGS_BY_NAME } from '@/db/graphql/clientOperations';
import { TagSearchInputProps } from '@/lib/molecules/TagSearchInput/TagSearchInput.types';

const TagSearchInput = ({ value, name }: TagSearchInputProps) => {
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
