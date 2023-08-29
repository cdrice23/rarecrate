import React, { useState, useEffect } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';

const AlbumSearchCombobox = ({
  value,
  enterHandler,
  updateSearchPrompt,
  listItems,
  searchQuery,
  loading,
  updateSelectedAlbum,
}) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);

  const [selectedItem, setSelectedItem] = useState(null);
  console.log(selectedItem);

  useEffect(() => {
    setInputItems(listItems);
  }, [listItems]);

  const { getToggleButtonProps, getMenuProps, getInputProps, highlightedIndex, getItemProps } = useCombobox({
    items: inputItems,
    itemToString: (item: any) => (item ? item.title : ''),
  });

  return (
    <div>
      <div className={cx('inputSection')}>
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
          })}
        />
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu">
          <CaretDown />
        </button>
      </div>
      <ul {...getMenuProps()} className={cx('menu')}>
        {isOpen &&
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
                  onClick: event => {
                    clearTimeout(debounceTimeout);
                    setDebounceTimeout(null);
                    setIsOpen(false);
                    updateSelectedAlbum(inputItems[highlightedIndex]);
                    setSelectedItem(inputItems[highlightedIndex]);
                    enterHandler(inputItems[highlightedIndex]);
                    setInputItems([]);
                    updateSearchPrompt('');
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
