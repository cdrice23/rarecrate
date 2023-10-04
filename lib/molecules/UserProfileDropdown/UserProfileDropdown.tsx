import { useSelect } from 'downshift';
import { DotOutline, MinusCircle } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLocalState } from '@/lib/context/state';
import cx from 'classnames';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';

const UserProfileDropdown = ({ userProfiles }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const { usernameMain, setUsernameMain } = useLocalState();

  const router = useRouter();

  const originalUserProfiles = [...userProfiles];
  const sortedUserProfiles = [...originalUserProfiles].sort((a, b) => {
    if (a.username === usernameMain) return -1;
    if (b.username === usernameMain) return 1;
    return 0;
  });
  sortedUserProfiles.push({ isAddProfile: true });

  const { isOpen, getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex } = useSelect({
    items: sortedUserProfiles,
    itemToString: () => userProfiles.map(userProfile => userProfile.username),
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem.isAddProfile) {
        // router.push(Route.NewProfile)
        console.log('Handle new profile creation');
      } else {
        setSelectedItem(newSelectedItem);
        setUsernameMain(newSelectedItem.username);
      }
    },
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
          sortedUserProfiles.map((userProfile, index) => {
            if (userProfile.isAddProfile) {
              return (
                <li key={index} {...getItemProps({ index, item: userProfile })}>
                  <div
                    className={cx('menuItem')}
                    style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  >
                    Add New Profile
                  </div>
                </li>
              );
            } else {
              return (
                <li
                  key={index}
                  {...getItemProps({
                    index,
                    item: userProfile,
                  })}
                >
                  <div
                    className={cx('menuItem')}
                    style={highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}}
                  >
                    <div className={cx('username')}>
                      <p>{userProfile.username}</p>
                      {userProfile.username === usernameMain && <DotOutline />}
                    </div>
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        handleDeleteProfile(userProfiles[index]);
                      }}
                    >
                      <MinusCircle />
                    </button>
                  </div>
                </li>
              );
            }
          })}
      </ul>
    </Pane>
  );
};

export { UserProfileDropdown };
