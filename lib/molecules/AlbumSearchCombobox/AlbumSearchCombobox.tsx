import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import { LOG_SELECTED_SEARCH_RESULT } from '@/db/graphql/clientOperations';
import { AlbumSearchResult } from '../AlbumSearchResult/AlbumSearchResult';
import { handleDiscogsSearch, onKeyDown, onChange, onMouseDown } from './AlbumSearchCombobox.helpers';
import { AlbumSearchComboboxProps } from '@/lib/molecules/AlbumSearchCombobox/AlbumSearchCombobox.types';

const AlbumSearchCombobox = ({
  value,
  enterHandler,
  updateSearchPrompt,
  listItems,
  searchQuery,
  loading,
  triggerDiscogsSearch,
}: AlbumSearchComboboxProps) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [expArtistResults, setExpArtistResults] = useState(0);
  const [expTitleResults, setExpTitleResults] = useState(0);
  const [loadingDiscogs, setLoadingDiscogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [logSelectedSearchResult] = useMutation(LOG_SELECTED_SEARCH_RESULT);

  const ulRef = useRef(null);
  const currentItems = inputItems.slice(0, currentPage * 30);

  // If no db results, trigger discogsSearch
  useEffect(() => {
    if (triggerDiscogsSearch) {
      // Delay handleDiscogsSearch by 1s to avoid rate-limit on discogs
      const timer = setTimeout(() => {
        handleDiscogsSearch(
          value,
          selectedPage,
          expArtistResults,
          expTitleResults,
          inputItems,
          setInputItems,
          setExpArtistResults,
          setExpTitleResults,
          setSelectedPage,
          setLoadingDiscogs,
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerDiscogsSearch]);

  // Load list items from graphQL query
  useEffect(() => {
    setInputItems(listItems);
    setCurrentPage(1);
  }, [listItems]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    itemToString: (item: any) => (item ? item.title : ''),
  });

  return (
    <div className={cx('searchInput')}>
      <div className={cx('inputSection')}>
        <OutsideClickHandler
          onOutsideClick={event => {
            if (!ulRef.current || !ulRef.current.contains(event.target)) {
              setIsOpen(false);
            }
          }}
        >
          <input
            {...getInputProps({
              value,
              placeholder: 'Search Albums',
              onKeyDown: async event => {
                onKeyDown(
                  event,
                  value,
                  inputItems,
                  highlightedIndex,
                  setIsOpen,
                  setSelectedItem,
                  enterHandler,
                  updateSearchPrompt,
                  debounceTimeout,
                  setDebounceTimeout,
                  logSelectedSearchResult,
                );
              },
              onChange: async event => {
                onChange(
                  event,
                  setIsOpen,
                  setLoadingDiscogs,
                  selectedItem,
                  debounceTimeout,
                  setDebounceTimeout,
                  searchQuery,
                  updateSearchPrompt,
                  setSelectedPage,
                  setExpArtistResults,
                  setExpTitleResults,
                );
              },
              onFocus: () => {
                if (value !== '') {
                  setIsOpen(true);
                }
              },
            })}
          />
        </OutsideClickHandler>
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu">
          <CaretDown />
        </button>
      </div>
      <ul {...getMenuProps({ ref: ulRef })} className={cx('menu', 'searchMenu')}>
        {isOpen &&
          (loading ? (
            <li>Searching...</li>
          ) : inputItems.length > 0 ? (
            <>
              {/* {inputItems.map((item, index) => ( */}
              {currentItems.map((item, index) => (
                <li
                  key={`album${index}`}
                  style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  {...getItemProps({
                    item,
                    index,
                    onMouseDown: () => {
                      onMouseDown(
                        setIsOpen,
                        setSelectedItem,
                        logSelectedSearchResult,
                        debounceTimeout,
                        setDebounceTimeout,
                        inputItems,
                        index,
                        highlightedIndex,
                        value,
                        enterHandler,
                        updateSearchPrompt,
                      );
                    },
                  })}
                >
                  <AlbumSearchResult
                    index={index}
                    title={item.title}
                    artist={item.artist}
                    imageUrl={item.imageUrl}
                    lastIndex={inputItems.length - 1}
                    lastSlice={currentPage * 30 - 1}
                    handleDiscogsSearch={() =>
                      handleDiscogsSearch(
                        value,
                        selectedPage,
                        expArtistResults,
                        expTitleResults,
                        inputItems,
                        setInputItems,
                        setExpArtistResults,
                        setExpTitleResults,
                        setSelectedPage,
                        setLoadingDiscogs,
                      )
                    }
                    setCurrentPage={setCurrentPage}
                  />
                </li>
              ))}
              {loadingDiscogs && <li>Searching for additional albums...</li>}
            </>
          ) : (
            !loading && !loadingDiscogs && !debounceTimeout && inputItems.length === 0 && <li>No results found</li>
          ))}
      </ul>
    </div>
  );
};

export { AlbumSearchCombobox };
