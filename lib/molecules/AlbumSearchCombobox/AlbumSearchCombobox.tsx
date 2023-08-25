import React, { useState, useEffect } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';

const AlbumSearchCombobox = ({ enterHandler, updateNewPill, listItems, searchQuery, loading }) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);

  // console.log(inputItems);

  useEffect(() => {
    setInputItems(listItems);
  }, [listItems]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      // Clear previous debounce timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      // When typing, run the passed search query
      if (inputValue) {
        setIsOpen(true);
        // Debounce to wait 300ms after user stops typing
        const newDebounceTimeout = setTimeout(() => {
          searchQuery({ variables: { searchTerm: inputValue } });
        }, 300);
        setDebounceTimeout(newDebounceTimeout);
      }

      if (inputValue === '') {
        setIsOpen(false);
      }
      // If we need to "add a new item"(i.e. not an existing item in search), update the text on the item
      updateNewPill(inputValue);
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      if (highlightedIndex !== -1 && inputItems) {
        updateNewPill(inputItems[highlightedIndex]);
      }
    },
  });

  return (
    <div>
      <div className={cx('inputSection')}>
        <input
          {...getInputProps({
            onKeyDown: event => {
              if (event.key === 'Enter') {
                enterHandler();
                setInputItems([]);
              }
            },
          })}
          maxLength={30}
        />
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu">
          <CaretDown />
        </button>
      </div>
      <ul {...getMenuProps()} className={cx('menu')}>
        {isOpen &&
          inputItems.length > 0 &&
          (loading ? (
            <li>Loading...</li>
          ) : (
            inputItems.map((item, index) => (
              <li
                style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                key={`album${index}`}
                {...getItemProps({
                  item,
                  index,
                  onClick: () => {
                    updateNewPill(inputItems[highlightedIndex]);
                    enterHandler();
                    setInputItems([]);
                  },
                })}
              >
                <div>{item.title}</div>
              </li>
            ))
          ))}
      </ul>
    </div>
  );
};

export { AlbumSearchCombobox };
