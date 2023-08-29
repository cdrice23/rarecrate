// import { useState, useEffect, useRef } from 'react';
// import { useCombobox } from 'downshift';
// import { CaretDown } from '@phosphor-icons/react';
// import cx from 'classnames';

// type AlbumSearchComboboxProps = {
//   searchQuery: any;
//   loading: boolean;
//   data: any;
//   enterHandler: (selectedObject: any) => void;
// };

// const AlbumSearchBar = ({ searchQuery, loading, data, enterHandler }: AlbumSearchComboboxProps) => {
//   const [searchPrompt, setSearchPrompt] = useState('');
//   const [isOpen, setIsOpen] = useState<boolean>(true);
//   const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>(null);

//   const debounceTimeoutRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       clearTimeout(debounceTimeoutRef.current);
//     };
//   }, [enterHandler]);

//   const { getMenuProps, getInputProps, highlightedIndex, getItemProps, getToggleButtonProps } = useCombobox({
//     items: data,
//     onInputValueChange: ({ inputValue }) => {
//       setSearchPrompt(inputValue);
//       if (debounceTimeout) {
//         clearTimeout(debounceTimeout);
//       }

//       if (inputValue !== '') {
//         setIsOpen(true);
//         // Clear previous debounce timeout
//         //   if (debounceTimeoutRef.current) {
//         //     clearTimeout(debounceTimeoutRef.current);
//         //     debounceTimeoutRef.current = null;
//         //   }

//         //   const newDebounceTimeout = setTimeout(() => {
//         //     searchQuery({ variables: { searchTerm: inputValue } });
//         //   }, 300);
//         //   debounceTimeoutRef.current = newDebounceTimeout;
//         //   setSearchPrompt(inputValue);
//         // } else {
//         //   setIsOpen(false);
//         //   clearTimeout(debounceTimeoutRef.current);
//         //   debounceTimeoutRef.current = null;
//         //   setSearchPrompt('');
//         // }

//         const newDebounceTimeout = setTimeout(() => {
//           searchQuery({ variables: { searchTerm: inputValue } });
//         }, 300);
//         setDebounceTimeout(newDebounceTimeout);
//       }
//     },
//     onSelectedItemChange: ({ selectedItem }) => {
//       // setSearchPrompt('');
//       // clearTimeout(debounceTimeout);

//       // setIsOpen(false);
//       // clearTimeout(debounceTimeoutRef.current);
//       // debounceTimeoutRef.current = null;

//       enterHandler(selectedItem);
//     },
//     itemToString: (item: any) => (item ? item.title : ''),
//   });

//   return (
//     <div>
//       <div className={cx('inputSection')}>
//         <input {...getInputProps()} placeholder="Search Albums" value={searchPrompt} />
//         <button {...getToggleButtonProps()} type="button">
//           <CaretDown />
//         </button>
//       </div>
//       <ul {...getMenuProps()} className={cx('menu')}>
//         {isOpen &&
//           (loading ? (
//             <li>Loading...</li>
//           ) : (
//             data.map((item, index) => (
//               <li
//                 key={index}
//                 className={cx({
//                   highlighted: highlightedIndex === index,
//                 })}
//                 style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
//                 {...getItemProps({ item, index })}
//               >
//                 {item.title}
//               </li>
//             ))
//           ))}
//       </ul>
//     </div>
//   );
// };

// export { AlbumSearchBar };
