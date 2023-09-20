import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Route } from '../../../core/enums/routes';
import { useCombobox } from 'downshift';
import { CaretDown, CaretLeft } from '@phosphor-icons/react';
import cx from 'classnames';
import { RUN_QUICK_SEARCH, LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { useLazyQuery, useMutation } from '@apollo/client';
import { QuickSearchPane } from '../QuickSearchPane/QuickSearchPane';
import { FullSearchController } from '../FullSearchController/FullSearchController';
import { useLocalState } from '@/lib/context/state';
import { PaneType } from '@/lib/context/state';

type SearchPath = {
  topTier?: { type: string; name: string };
  midTier?: { type: string; name: string };
};

const GlobalSearch = () => {
  const {
    globalSearchPrompt,
    setGlobalSearchPrompt,
    quickSearchResults,
    setQuickSearchResults,
    currentActivePane,
    setCurrentActivePane,
    prevActivePane,
    setPrevActivePane,
  } = useLocalState();
  const [inputItems, setInputItems] = useState(quickSearchResults || []);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [searchQuery, { loading, data }] = useLazyQuery(RUN_QUICK_SEARCH);
  const [searchPrompt, setSearchPrompt] = useState<string>(globalSearchPrompt);
  const [showFullSearchPane, setShowFullSearchPane] = useState<boolean>(false);
  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);
  const [searchPath, setSearchPath] = useState<SearchPath>({});
  // const [activePane, setActivePane] = useState<PaneType>(currentActivePane);

  const profileResults = data?.qsProfiles || [];
  const crateResults = data?.qsCrates || [];
  const searchResults = [...profileResults, ...crateResults]
    .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount)
    .slice(0, 9);
  const router = useRouter();

  // console.log(inputItems);
  // console.log(showFullSearchPane);

  // Load list items from graphQL query
  useEffect(() => {
    if (data && searchPrompt !== '') {
      setInputItems([...searchResults, { isShowMoreButton: true }]);
      setQuickSearchResults([...searchResults, { isShowMoreButton: true }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, debounceTimeout]);

  useEffect(() => {
    setGlobalSearchPrompt(searchPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchPrompt]);

  const { getToggleButtonProps, getInputProps, highlightedIndex, getMenuProps, getItemProps } = useCombobox({
    items: inputItems || [],
    // itemToString: (item: any) => (item ? item.title : ''),
  });

  return (
    <div className={cx('searchPane')}>
      <div className={cx('inputSection')}>
        {showFullSearchPane && (
          <button
            className={cx('backButton')}
            onClick={() => {
              switch (currentActivePane) {
                case 'profiles':
                case 'crates':
                case 'albums':
                case 'labelsAndTags':
                case 'genresAndSubgenres':
                  setShowFullSearchPane(false);
                  setSearchPath({});
                  break;
                case 'cratesFromLabel':
                case 'albumsFromTag':
                  setCurrentActivePane('labelsAndTags');
                  setSearchPath({});
                  break;
                case 'albumsFromGenre':
                case 'albumsFromSubgenre':
                  setCurrentActivePane('genresAndSubgenres');
                  setSearchPath({});
                  break;
                case 'cratesFromAlbum':
                  setCurrentActivePane(prevActivePane);
                  switch (prevActivePane) {
                    case 'albumsFromTag':
                      setPrevActivePane('labelsAndTags');
                      setSearchPath({ ...searchPath, midTier: null });
                      break;
                    case 'albumsFromGenre':
                    case 'albumsFromSubgenre':
                      setPrevActivePane('genresAndSubgenres');
                      setSearchPath({ ...searchPath, midTier: null });
                      break;
                  }
                default:
                  break;
              }
            }}
          >
            <CaretLeft />
          </button>
        )}
        <input
          {...getInputProps({
            value: searchPrompt,
            placeholder: 'Search Rare Crate',
            onKeyDown: async event => {
              if (event.key === 'Enter' && !showFullSearchPane) {
                clearTimeout(debounceTimeout);
                setDebounceTimeout(null);

                // Handle routes
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
                setQuickSearchResults([]);
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
              // setGlobalSearchPrompt(inputValue);
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
      {showFullSearchPane && (
        <FullSearchController
          searchPath={searchPath}
          setSearchPath={setSearchPath}
          searchPrompt={searchPrompt}
          activePane={currentActivePane}
          prevActivePane={prevActivePane}
          setActivePane={setCurrentActivePane}
          setPrevActivePane={setPrevActivePane}
        />
      )}
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
        handleShowFullSearch={() => {
          setCurrentActivePane('profiles');
          setShowFullSearchPane(true);
        }}
      />
    </div>
  );
};

export { GlobalSearch };
