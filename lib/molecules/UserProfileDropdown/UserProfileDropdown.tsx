import { useSelect } from 'downshift';
import { DotOutline, MinusCircle } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLocalState } from '@/lib/context/state';
import cx from 'classnames';
import { useState } from 'react';

const UserProfileDropdown = ({ userProfiles }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const { usernameMain, setUsernameMain } = useLocalState();
  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex } = useSelect({
    items: userProfiles,
    itemToString: () => userProfiles.map(userProfile => userProfile.username),
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      setSelectedItem(newSelectedItem);
      setUsernameMain(newSelectedItem.username);
    },
  });

  const sortedUserProfiles = [...userProfiles].sort((a, b) => {
    if (a.username === usernameMain) return -1;
    if (b.username === usernameMain) return 1;
    return 0;
  });

  const handleDeleteProfile = profile => {
    console.log(`You are trying to delete: ${profile.username}`);
  };

  return (
    <Pane>
      <div className={'currentProfileButton'}>
        <button {...getToggleButtonProps()} type="button">
          {<p>{`Current Profile: ${usernameMain}`}</p>}
        </button>
      </div>
      <ul {...getMenuProps()} className={cx('dropdownMenu')}>
        {isOpen &&
          sortedUserProfiles.map((userProfile, index) => (
            <li
              key={index}
              style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
              {...getItemProps({
                index,
                item: userProfile,
                // onSelect: handleSelectProfile,
              })}
            >
              <div className={cx('menuItem')}>
                <div className={cx('username')}>
                  <p>{userProfile.username}</p>
                  {userProfile.username === usernameMain && <DotOutline />}
                </div>
                <button
                  onClick={event => {
                    event.stopPropagation();
                    handleDeleteProfile(userProfiles[index]);
                    // Add logic to delete profile
                  }}
                >
                  <MinusCircle />
                </button>
              </div>
            </li>
          ))}
      </ul>
    </Pane>
  );
};

export { UserProfileDropdown };
