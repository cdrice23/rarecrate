import React, { useState, useEffect, useRef } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { AlbumSearchResult } from '../AlbumSearchResult/AlbumSearchResult';
import { fetchDiscogsResults } from '../../../core/helpers/discogs';

const AlbumSearchCombobox = ({
  value,
  enterHandler,
  updateSearchPrompt,
  listItems,
  searchQuery,
  loading,
  triggerDiscogsSearch,
}) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [expArtistResults, setExpArtistResults] = useState(0);
  const [expTitleResults, setExpTitleResults] = useState(0);
  const [loadingDiscogs, setLoadingDiscogs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ulRef = useRef(null);
  const currentItems = inputItems.slice(0, currentPage * 30);

  // If no db results, trigger discogsSearch
  useEffect(() => {
    if (triggerDiscogsSearch) {
      // console.log('trigger the search!');
      handleDiscogsSearch();
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

  const handleDiscogsSearch = async () => {
    setLoadingDiscogs(true);
    const newResults = await fetchDiscogsResults(value, selectedPage, 15, expArtistResults, expTitleResults);
    setExpArtistResults(Number(newResults.expArtistResults));
    setExpTitleResults(Number(newResults.expTitleResults));
    setSelectedPage(selectedPage + 1);
    const updatedResults = [...inputItems, ...newResults.formattedResults];
    const uniqueUpdatedResults = updatedResults.filter(
      (v, i, a) => a.findIndex(t => t.discogsMasterId === v.discogsMasterId) === i,
    );
    setInputItems(uniqueUpdatedResults);
    setLoadingDiscogs(false);
  };

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
              onKeyDown: event => {
                if (event.key === 'Enter') {
                  clearTimeout(debounceTimeout);
                  setDebounceTimeout(null);
                  setIsOpen(false);
                  setSelectedItem(inputItems[highlightedIndex]);
                  enterHandler(inputItems[highlightedIndex]);
                  // setInputItems([]);
                  updateSearchPrompt('');
                }
              },
              onChange: event => {
                const inputValue = event.currentTarget.value;
                // Reset state for discogs searches
                setLoadingDiscogs(false);
                setSelectedPage(1);
                setExpArtistResults(0);
                setExpTitleResults(0);
                // Clear previous debounce timeout
                if (debounceTimeout) {
                  clearTimeout(debounceTimeout);
                }

                // When typing, run the passed search query
                if (inputValue !== selectedItem?.title) {
                  setIsOpen(true);
                  // Debounce to wait 300ms after user stops typing
                  const newDebounceTimeout = setTimeout(() => {
                    searchQuery({ variables: { searchTerm: inputValue } });
                    console.log('You are done typing');
                  }, 300);
                  setDebounceTimeout(newDebounceTimeout);
                }

                updateSearchPrompt(inputValue);

                if (inputValue === '') {
                  setIsOpen(false);
                }
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
                      clearTimeout(debounceTimeout);
                      setDebounceTimeout(null);
                      setIsOpen(false);
                      setSelectedItem(inputItems[index]);
                      enterHandler(inputItems[index]);
                      // setInputItems([]);
                      updateSearchPrompt('');
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
                    handleDiscogsSearch={handleDiscogsSearch}
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
