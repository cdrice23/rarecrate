import React, { useState, useEffect, useRef } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import { RUN_QUICK_SEARCH } from '@/db/graphql/clientOperations';
import { useLazyQuery } from '@apollo/client';

const QuickSearchPane = () => {
  const [inputItems, setInputItems] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, { loading, data }] = useLazyQuery(RUN_QUICK_SEARCH);
  const [searchPrompt, setSearchPrompt] = useState<string>('');

  const profileResults = data?.qsProfiles || [];
  const crateResults = data?.qsCrates || [];
  const searchResults = [...profileResults, ...crateResults];

  console.log(inputItems);
  console.log(searchResults);

  const ulRef = useRef(null);
  const currentItems = inputItems.slice(0, currentPage * 30);

  // Load list items from graphQL query
  useEffect(() => {
    if (data && searchPrompt !== '') {
      setInputItems(searchResults);
      setCurrentPage(1);
    }
  }, [data]);

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
            placeholder: 'Search Albums',
            onKeyDown: event => {
              if (event.key === 'Enter') {
                clearTimeout(debounceTimeout);
                setDebounceTimeout(null);
                setSelectedItem(inputItems[highlightedIndex]);
                setSearchPrompt('');
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
              // Reset state for discogs searches
              setSelectedPage(1);
              // Clear previous debounce timeout
              if (debounceTimeout) {
                clearTimeout(debounceTimeout);
              }

              // When typing, run the passed search query
              if (inputValue !== selectedItem?.title && inputValue !== '') {
                // Debounce to wait 300ms after user stops typing
                const newDebounceTimeout = setTimeout(() => {
                  searchQuery({ variables: { searchTerm: inputValue } });
                  console.log('You are done typing');
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

      <ul {...getMenuProps({ ref: ulRef })} className={cx('searchMenu')}>
        {loading ? (
          <li>Searching...</li>
        ) : inputItems.length > 0 ? (
          <>
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

                    setSelectedItem(inputItems[index]);
                    setSearchPrompt('');
                  },
                })}
              >
                Result
                {/* <div
                index={index}
                title={item.title}
                artist={item.artist}
                imageUrl={item.imageUrl}
                lastIndex={inputItems.length - 1}
                lastSlice={currentPage * 30 - 1}
                setCurrentPage={setCurrentPage}
                >
                  Result!
                </div> */}
              </li>
            ))}
          </>
        ) : null}
      </ul>
    </div>
  );
};

export { QuickSearchPane };
