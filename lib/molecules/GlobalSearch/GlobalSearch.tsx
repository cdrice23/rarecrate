import OutsideClickHandler from 'react-outside-click-handler';
import cx from 'classnames';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLazyQuery, useMutation } from '@apollo/client';
import { useCombobox } from 'downshift';
import { CaretDown, CaretLeft } from '@phosphor-icons/react';
import { useLocalState } from '@/lib/context/state';
import { RUN_QUICK_SEARCH, LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations/search';
import { QuickSearchPane } from '../QuickSearchPane/QuickSearchPane';
import { FullSearchController } from '../FullSearchController/FullSearchController';
import { handleOnClick, handleOnChange, handleOnKeyDown } from './GlobalSearch.helpers';
import { SearchPath } from '@/lib/molecules/GlobalSearch/GlobalSearch.types';
import { GlobalSearchProps } from './GlobalSearch.helpers';

const GlobalSearch = ({ showSearchResults, setShowSearchResults }: GlobalSearchProps) => {
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

  const { getInputProps, highlightedIndex, getMenuProps, getItemProps } = useCombobox({
    items: inputItems || [],
  });

  console.log('show full search pane?', showFullSearchPane);

  const profileResults = data?.qsProfiles || [];
  const crateResults = data?.qsCrates || [];
  const searchResults = [...profileResults, ...crateResults]
    .sort((a, b) => b.searchAndSelectCount - a.searchAndSelectCount)
    .slice(0, 9);
  const router = useRouter();

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

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        console.log('outside click!');
        setShowFullSearchPane(false);
        setShowSearchResults(false);
      }}
    >
      <div className={cx('searchPane')}>
        <div className={cx('inputSection')}>
          {showFullSearchPane && (
            <button
              className={cx('backButton')}
              onClick={() => {
                handleOnClick(
                  currentActivePane,
                  prevActivePane,
                  setShowFullSearchPane,
                  setSearchPath,
                  setPrevActivePane,
                  searchPath,
                  setCurrentActivePane,
                );
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
                handleOnKeyDown(
                  event,
                  showFullSearchPane,
                  setShowFullSearchPane,
                  setCurrentActivePane,
                  logSelectedSearchResult,
                  router,
                  inputItems,
                  highlightedIndex,
                  debounceTimeout,
                  setDebounceTimeout,
                );
              },
              onChange: event => {
                handleOnChange(
                  event,
                  setShowFullSearchPane,
                  setSearchPrompt,
                  setInputItems,
                  setQuickSearchResults,
                  searchQuery,
                  debounceTimeout,
                  setDebounceTimeout,
                  setShowSearchResults,
                );
              },
              onFocus: () => {
                setShowSearchResults(true);
                setShowFullSearchPane(false);
              },
              onClick: () => {
                setShowSearchResults(true);
                setShowFullSearchPane(false);
              },
            })}
          />
        </div>
        {showSearchResults && showFullSearchPane && (
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
          style={{
            display:
              (showSearchResults === true && showFullSearchPane === true) || showSearchResults === false
                ? 'none'
                : 'block',
          }}
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
    </OutsideClickHandler>
  );
};

export { GlobalSearch };
