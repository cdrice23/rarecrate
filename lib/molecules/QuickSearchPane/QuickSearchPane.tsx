import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import cx from 'classnames';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';
import { GetMenuPropsOptions, GetItemPropsOptions } from 'downshift';
import { useMutation } from '@apollo/client';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';

interface QuickSearchPaneProps {
  style: any;
  inputItems: any[];
  loading: boolean;
  searchPrompt: string;
  debounceTimeout: any;
  setDebounceTimeout: (value) => void;
  getMenuProps: (options?: GetMenuPropsOptions) => any;
  getItemProps: <Item>(options: GetItemPropsOptions<Item>) => any;
  highlightedIndex: number | null;
  handleShowFullSearch: () => void;
}

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
  const router = useRouter();

  return (
    <ul {...getMenuProps()} className={cx('searchMenu')} style={style}>
      {loading ? (
        <li>Searching...</li>
      ) : inputItems.length > 0 ? (
        <>
          {inputItems.map((item, index) =>
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
                    clearTimeout(debounceTimeout);
                    setDebounceTimeout(null);

                    // setSelectedItem(inputItems[index]);

                    // Handle routes
                    console.log(inputItems[highlightedIndex]);
                    if (inputItems[highlightedIndex].__typename === 'Profile') {
                      router.push(Route.Profile + `/${inputItems[highlightedIndex].username}`);
                      await logSelectedSearchResult({
                        variables: { prismaModel: 'profile', selectedId: inputItems[highlightedIndex].id },
                      });
                    }

                    if (inputItems[highlightedIndex].__typename === 'Crate') {
                      router.push({
                        pathname: Route.Profile + `/${inputItems[highlightedIndex].creator.username}`,
                        query: { searchedCrateSelected: inputItems[highlightedIndex].id },
                      });
                      await logSelectedSearchResult({
                        variables: { prismaModel: 'crate', selectedId: inputItems[highlightedIndex].id },
                      });
                    }
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
