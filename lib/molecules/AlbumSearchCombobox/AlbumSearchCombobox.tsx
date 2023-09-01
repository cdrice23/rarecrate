import React, { useState, useEffect, useReducer } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import OutsideClickHandler from 'react-outside-click-handler';
import { AlbumSearchResult } from '../AlbumSearchResult/AlbumSearchResult';
import { fetchDiscogsResults } from '../../../core/helpers/discogs';

const AlbumSearchCombobox = ({ value, enterHandler, updateSearchPrompt, listItems, searchQuery, loading }) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [expArtistResults, setExpArtistResults] = useState(0);
  const [expTitleResults, setExpTitleResults] = useState(0);
  const [loadingDiscogs, setLoadingDiscogs] = useState(false);

  useEffect(() => {
    setInputItems(listItems);
  }, [listItems]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    itemToString: (item: any) => (item ? item.title : ''),
  });

  return (
    <div className={cx('searchInput')}>
      <div className={cx('inputSection')}>
        <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
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
                  setInputItems([]);
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
                setIsOpen(true);
                // Clear previous debounce timeout
                if (debounceTimeout) {
                  clearTimeout(debounceTimeout);
                }

                // When typing, run the passed search query
                if (inputValue !== selectedItem?.title) {
                  // Debounce to wait 300ms after user stops typing
                  const newDebounceTimeout = setTimeout(() => {
                    searchQuery({ variables: { searchTerm: inputValue } });
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
      <ul {...getMenuProps()} className={cx('menu', 'searchMenu')}>
        {isOpen &&
          (loading ? (
            <li>Searching...</li>
          ) : inputItems.length > 0 ? (
            <>
              {inputItems.map((item, index) => (
                <li
                  key={`album${index}`}
                  {...getItemProps({
                    item,
                    index,
                    onClick: () => {
                      clearTimeout(debounceTimeout);
                      setDebounceTimeout(null);
                      setIsOpen(false);
                      setSelectedItem(inputItems[highlightedIndex]);
                      enterHandler(inputItems[highlightedIndex]);
                      setInputItems([]);
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
                    handleDiscogsSearch={async () => {
                      setLoadingDiscogs(true);
                      // Call fetchDiscogsResults
                      console.log(`We're running the search`);
                      const newResults = await fetchDiscogsResults(
                        value,
                        selectedPage,
                        15,
                        expArtistResults,
                        expTitleResults,
                      );
                      // Update the states accordingly
                      setExpArtistResults(Number(newResults.expArtistResults));
                      setExpTitleResults(Number(newResults.expTitleResults));
                      setSelectedPage(selectedPage + 1);
                      // Push response into end of inputItems & filter out dupes
                      const updatedResults = [...inputItems, ...newResults.formattedResults];
                      const uniqueUpdatedResults = updatedResults.filter(
                        (v, i, a) => a.findIndex(t => t.discogsMasterId === v.discogsMasterId) === i,
                      );
                      setInputItems(uniqueUpdatedResults);
                      setLoadingDiscogs(false);
                    }}
                  />
                </li>
              ))}
              {loadingDiscogs && <li>Searching for additional albums...</li>}
            </>
          ) : (
            !loading && inputItems.length === 0 && <li>No results found</li>
          ))}
      </ul>
    </div>
  );
};

export { AlbumSearchCombobox };
