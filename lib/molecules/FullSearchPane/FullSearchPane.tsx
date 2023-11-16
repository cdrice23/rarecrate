import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { useLocalState } from '@/lib/context/state';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { handleOnClick } from './FullSearchPane.helpers';

interface FullSearchPaneProps {
  currentItems: any[];
  currentPage: number;
  searchPath: {
    topTier?: { type: string; name: string; id: number };
    midTier?: { type: string; name: string; id: number };
  };
  setSearchPath: (value) => void;
  getMoreItems?: () => void;
  getNextPane?: (value, searchId) => void;
}

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
