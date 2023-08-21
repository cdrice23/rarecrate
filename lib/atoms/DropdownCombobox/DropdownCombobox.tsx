import React, { useState } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';

const DropdownCombobox = ({ enterHandler, updateNewPill, listItems, itemLabel }) => {
  const [inputItems, setInputItems] = useState(listItems.map(item => item[itemLabel]));
  const { isOpen, getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(inputItems.filter(item => item.toLowerCase().startsWith(inputValue.toLowerCase())));
      updateNewPill(inputValue);
    },
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      updateNewPill(inputItems[highlightedIndex]);
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
              key={`${item}${index}`}
              {...getItemProps({
                item,
                index,
                onClick: () => {
                  updateNewPill(inputItems[highlightedIndex]);
                  enterHandler();
                },
              })}
            >
              {item}
            </li>
          ))}
      </ul>
    </div>
  );
};

export { DropdownCombobox };
