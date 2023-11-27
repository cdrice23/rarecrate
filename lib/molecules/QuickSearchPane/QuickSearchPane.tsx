import cx from 'classnames';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { useLocalState } from '@/lib/context/state';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { handleOnMouseDown } from './QuickSearchPane.helpers';
import { QuickSearchPaneProps } from '@/lib/molecules/QuickSearchPane/QuickSearchPane.types';

const QuickSearchPane = ({
  style,
  inputItems,
  loading,
  searchPrompt,
  debounceTimeout,
  setDebounceTimeout,
  getMenuProps,
  getItemProps,
  highlightedIndex,
  handleShowFullSearch,
}: QuickSearchPaneProps) => {
  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);
  const { profileIdMain } = useLocalState();
  const router = useRouter();

  return (
    <ul {...getMenuProps()} className={cx('searchMenu')} style={style}>
      {loading ? (
        <li>Searching...</li>
      ) : inputItems.length > 0 ? (
        <>
          {inputItems
            .filter(
              item =>
                !(
                  item.__typename === 'Crate' &&
                  item.creator.isPrivate &&
                  !item.creator.followers.some(follower => follower.id === profileIdMain)
                ),
            )
            .map((item, index) =>
              item.isShowMoreButton ? (
                <li
                  key={index}
                  style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  {...getItemProps({
                    item,
                    index,
                    onMouseDown: () => {
                      handleShowFullSearch();
                    },
                  })}
                >
                  <div className={cx('showMore')}>
                    <h4>{`See all results for "${searchPrompt}"`}</h4>
                  </div>
                </li>
              ) : (
                <li
                  key={index}
                  style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  {...getItemProps({
                    item,
                    index,
                    onMouseDown: async () => {
                      handleOnMouseDown(item, debounceTimeout, setDebounceTimeout, router, logSelectedSearchResult);
                    },
                  })}
                >
                  <GlobalSearchResult data={item} index={index} />
                </li>
              ),
            )}
        </>
      ) : null}
    </ul>
  );
};

export { QuickSearchPane };
