import React, { useState, useEffect } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';

const DropdownCombobox = ({ enterHandler, updateNewPill, listItems, itemLabel, searchQuery, loading }) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  console.log(inputItems);

  useEffect(() => {
    setInputItems(listItems);
  }, [listItems]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      // When typing, run the passed search query
      if (inputValue) {
        setIsOpen(true);
        searchQuery({ variables: { searchTerm: inputValue } });
      }

      if (inputValue === '') {
        setIsOpen(false);
      }
      // If we need to "add a new item"(i.e. not an existing item in search), update the text on the item
      updateNewPill(inputValue);
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      if (highlightedIndex !== -1 && inputItems) {
        updateNewPill(inputItems[highlightedIndex][itemLabel]);
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
                key={`${item[itemLabel]}${index}`}
                {...getItemProps({
                  item,
                  index,
                  onClick: () => {
                    updateNewPill(inputItems[highlightedIndex][itemLabel]);
                    enterHandler();
                    setInputItems([]);
                  },
                })}
              >
                {item[itemLabel]}
              </li>
            ))
          ))}
      </ul>
    </div>
  );
};

export { DropdownCombobox };
