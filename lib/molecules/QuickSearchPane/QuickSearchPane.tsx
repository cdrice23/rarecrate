import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import { RUN_QUICK_SEARCH } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';
import { GlobalSearchResult } from '../GlobalSearchResult/GlobalSearchResult';

const QuickSearchPane = () => {
  const [inputItems, setInputItems] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, { loading, data }] = useLazyQuery(RUN_QUICK_SEARCH);
  const [searchPrompt, setSearchPrompt] = useState<string>('');

  const profileResults = data?.qsProfiles || [];
  const crateResults = data?.qsCrates || [];
  const searchResults = [...profileResults, ...crateResults]
    .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount)
    .slice(0, 9);
  const router = useRouter();

  console.log(inputItems);
  // console.log(searchResults);

  // Load list items from graphQL query
  useEffect(() => {
    if (data && searchPrompt !== '') {
      setInputItems([...searchResults, { isShowMoreButton: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, debounceTimeout]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems || [],
    // itemToString: (item: any) => (item ? item.title : ''),
  });

  return (
    <div className={cx('searchPane')}>
      <div className={cx('inputSection')}>
        <input
          {...getInputProps({
            value: searchPrompt,
            placeholder: 'Search Rare Crate',
            onKeyDown: event => {
              if (event.key === 'Enter') {
                clearTimeout(debounceTimeout);
                setDebounceTimeout(null);
                setSelectedItem(inputItems[highlightedIndex]);

                // Handle routes
                console.log(inputItems[highlightedIndex]);
                if (inputItems[highlightedIndex].__typename === 'Profile') {
                  router.push(Route.Profile + `/${inputItems[highlightedIndex].username}`);
                }

                if (inputItems[highlightedIndex].__typename === 'Crate') {
                  router.push({
                    pathname: Route.Profile + `/${inputItems[highlightedIndex].creator.username}`,
                    query: { searchedCrateSelected: inputItems[highlightedIndex].id },
                  });
                }

                if (inputItems[highlightedIndex].isShowMoreButton) {
                  console.log('You were all wrong! Twas a show more!!');
                }
              }
            },
            onChange: event => {
              const inputValue = event.currentTarget.value;

              if (inputValue === '') {
                clearTimeout(debounceTimeout);
                setDebounceTimeout(null);
                setSearchPrompt(inputValue);
                setInputItems([]);
              }
              // Clear previous debounce timeout
              if (debounceTimeout) {
                clearTimeout(debounceTimeout);
              }

              // When typing, run the passed search query
              if (inputValue !== '') {
                // Debounce to wait 300ms after user stops typing
                const newDebounceTimeout = setTimeout(() => {
                  searchQuery({ variables: { searchTerm: inputValue } });
                }, 300);
                setDebounceTimeout(newDebounceTimeout);
              }

              setSearchPrompt(inputValue);
            },
            onFocus: () => {
              // if (searchPrompt !== '') {
              //   setIsOpen(true);
              // }
            },
          })}
        />
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu">
          <CaretDown />
        </button>
      </div>

      <ul {...getMenuProps()} className={cx('searchMenu')}>
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
                      console.log('You were all wrong! Twas a show more!!');
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
                    onMouseDown: () => {
                      clearTimeout(debounceTimeout);
                      setDebounceTimeout(null);

                      setSelectedItem(inputItems[index]);

                      // Handle routes
                      console.log(inputItems[highlightedIndex]);
                      if (inputItems[highlightedIndex].__typename === 'Profile') {
                        router.push(Route.Profile + `/${inputItems[highlightedIndex].username}`);
                      }

                      if (inputItems[highlightedIndex].__typename === 'Crate') {
                        router.push({
                          pathname: Route.Profile + `/${inputItems[highlightedIndex].creator.username}`,
                          query: { searchedCrateSelected: inputItems[highlightedIndex].id },
                        });
                      }
                    },
                  })}
                >
                  <GlobalSearchResult data={item} />
                </li>
              ),
            )}
          </>
        ) : null}
      </ul>
    </div>
  );
};

export { QuickSearchPane };
