import React, { useState } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';

const DropdownCombobox = ({ enterHandler, updateNewPill, listItems, itemLabel }) => {
  const [inputItems, setInputItems] = useState([...listItems]);
  const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      // Filter the menu based on input values
      const filteredItem = inputItems.filter(item =>
        item[itemLabel].toLowerCase().startsWith(inputValue.toLowerCase()),
      );
      setInputItems(filteredItem);
      // If we need to "add a new Label", update the text on the item
      updateNewPill(inputValue);
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      if (highlightedIndex !== -1) {
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
                },
              })}
            >
              {item[itemLabel]}
            </li>
          ))}
      </ul>
    </div>
  );
};

export { DropdownCombobox };
