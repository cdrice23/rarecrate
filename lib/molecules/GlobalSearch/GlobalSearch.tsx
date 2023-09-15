import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import { RUN_QUICK_SEARCH } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';
import { QuickSearchPane } from '../QuickSearchPane/QuickSearchPane';
import { FullSearchPane } from '../FullSearchPane/FullSearchPane';

const GlobalSearch = () => {
  const [inputItems, setInputItems] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [searchQuery, { loading, data }] = useLazyQuery(RUN_QUICK_SEARCH);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [showFullSearchPane, setShowFullSearchPane] = useState<boolean>(false);
  const [activePane, setActivePane] = useState<
    'profiles' | 'crates' | 'albums' | 'labelsAndTags' | 'genresAndSubgenres'
  >('profiles');

  const handlePaneSelect = (pane: 'profiles' | 'crates' | 'albums' | 'labelsAndTags' | 'genresAndSubgenres') => {
    setActivePane(pane);
  };

  const profileResults = data?.qsProfiles || [];
  const crateResults = data?.qsCrates || [];
  const searchResults = [...profileResults, ...crateResults]
    .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount)
    .slice(0, 9);
  const router = useRouter();

  // console.log(inputItems);
  // console.log(searchResults);

  // Load list items from graphQL query
  useEffect(() => {
    if (data && searchPrompt !== '') {
      setInputItems([...searchResults, { isShowMoreButton: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, debounceTimeout]);

  const { getToggleButtonProps, getInputProps, highlightedIndex, getMenuProps, getItemProps } = useCombobox({
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

                // Handle routes
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
                  setShowFullSearchPane(true);
                }
              }
            },
            onChange: event => {
              setShowFullSearchPane(false);
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
              setShowFullSearchPane(false);
            },
          })}
        />
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu">
          <CaretDown />
        </button>
      </div>
      {showFullSearchPane && <FullSearchPane handlePaneSelect={handlePaneSelect} />}
      <QuickSearchPane
        style={{ display: showFullSearchPane ? 'none' : 'block' }}
        inputItems={inputItems}
        loading={loading}
        searchPrompt={searchPrompt}
        debounceTimeout={debounceTimeout}
        setDebounceTimeout={setDebounceTimeout}
        getMenuProps={getMenuProps}
        getItemProps={getItemProps}
        highlightedIndex={highlightedIndex}
        handleShowFullSearch={() => setShowFullSearchPane(true)}
      />
    </div>
  );
};

export { GlobalSearch };
