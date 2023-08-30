import React, { useState, useEffect, useRef } from 'react';
import { useCombobox } from 'downshift';
import { CaretDown } from '@phosphor-icons/react';
import cx from 'classnames';
import Image from 'next/image';
import { motion } from 'framer-motion';
import OutsideClickHandler from 'react-outside-click-handler';
import greySquareImage from '@/core/constants/placeholders/grey_square.png';
import { AlbumSearchResult } from '../AlbumSearchResult/AlbumSearchResult';

const AlbumSearchCombobox = ({ value, enterHandler, updateSearchPrompt, listItems, searchQuery, loading }) => {
  const [inputItems, setInputItems] = useState([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);
  const [selectedItem, setSelectedItem] = useState(null);

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
                  {/* <motion.div
                    className={cx('searchResult')}
                    onViewportEnter={() => {
                      if (index === inputItems.length - 1) {
                        console.log(`${item.title} is the last item!`);
                      }
                    }}
                  >
                    <Image src={item.imageUrl} height={55} width={55} alt={item.title} className={cx('albumCover')} />
                    <div className={cx('description')}>
                      <h3>{item.title}</h3>
                      <p>{item.artist}</p>
                    </div>
                  </motion.div> */}
                  <AlbumSearchResult
                    index={index}
                    title={item.title}
                    artist={item.artist}
                    imageUrl={item.imageUrl}
                    lastIndex={inputItems.length - 1}
                  />
                </li>
              ))}
            </>
          ) : (
            !loading && inputItems.length === 0 && <li>No results found</li>
          ))}
      </ul>
    </div>
  );
};

export { AlbumSearchCombobox };
