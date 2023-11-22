import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useLocalState } from '@/lib/context/state';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { handleOnClick } from './FullSearchPane.helpers';
import { FullSearchPaneProps } from '@/types/molecules/FullSearchPane.types';

const FullSearchPane = ({
  currentItems,
  searchPath,
  getMoreItems,
  getNextPane,
  setSearchPath,
}: FullSearchPaneProps) => {
  const { currentActivePane } = useLocalState();
  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);
  const router = useRouter();

  return (
    <>
      {currentItems.length === 0 && <li>{`No results!`}</li>}
      {currentItems.map((result, index) => (
        <li
          key={index}
          onClick={async () => {
            handleOnClick(
              result,
              searchPath,
              currentActivePane,
              setSearchPath,
              getNextPane,
              logSelectedSearchResult,
              router,
            );
          }}
        >
          <GlobalSearchResult
            data={result}
            index={index}
            lastSlice={currentItems.length - 1}
            getMoreItems={getMoreItems}
          />
        </li>
      ))}
    </>
  );
};

export { FullSearchPane };
