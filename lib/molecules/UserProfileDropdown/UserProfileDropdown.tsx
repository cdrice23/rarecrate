import { useSelect } from 'downshift';
import { DotOutline, MinusCircle } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLocalState } from '@/lib/context/state';
import cx from 'classnames';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';
import { Message } from '@/lib/atoms/Message/Message';
import { DeleteProfile } from '../DeleteProfile/DeleteProfile';
import { boolean } from 'yup';

const UserProfileDropdown = ({ userProfiles }) => {
  const [dropdownProfiles, setDropdownProfiles] = useState(userProfiles);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteProfileMessage, setShowDeleteProfileMessage] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const { usernameMain, setUsernameMain, setProfileIdMain } = useLocalState();

  const router = useRouter();

  const originalUserProfiles = [...dropdownProfiles];
  const sortedUserProfiles = [...originalUserProfiles].sort((a, b) => {
    if (a.username === usernameMain) return -1;
    if (b.username === usernameMain) return 1;
    return 0;
  });
  if (dropdownProfiles.length < 5) {
    sortedUserProfiles.push({ isAddProfile: true });
  }

  const { getToggleButtonProps, getMenuProps, getItemProps, highlightedIndex } = useSelect({
    items: sortedUserProfiles,
    itemToString: () => dropdownProfiles.map(userProfile => userProfile.username),
    selectedItem,
    onSelectedItemChange: ({ selectedItem: newSelectedItem }) => {
      if (newSelectedItem.isAddProfile) {
        router.push(Route.NewProfile);
        // console.log('Handle new profile creation');
      } else {
        setIsOpen(false);
        setSelectedItem(newSelectedItem);
        setUsernameMain(newSelectedItem.username);
        setProfileIdMain(newSelectedItem.id);
        router.replace(Route.Profile + `/${newSelectedItem.username}`);
      }
    },
  });

  const handleDeleteProfile = profile => {
    console.log(`You are trying to delete: ${profile.username}`);
    setProfileToDelete(profile);
    setShowDeleteProfileMessage(true);
  };

  const handleUpdateProfileList = deletedProfile => {
    const updatedProfileList = dropdownProfiles.filter(profile => profile.id !== deletedProfile);
    setDropdownProfiles(updatedProfileList);
  };

  return (
    <Pane>
      <div className={'currentProfileButton'}>
        <button {...getToggleButtonProps()} type="button" onClick={() => setIsOpen(!isOpen)} disabled={isDeleting}>
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
                    {`Add New Profile`}
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
                        event.preventDefault();
                        event.stopPropagation();
                        handleDeleteProfile(sortedUserProfiles[index]);
                        setIsOpen(false);
                      }}
                    >
                      <MinusCircle />
                    </button>
                  </div>
                </li>
              );
            }
          })}
        <Message
          title={'Confirm delete profile'}
          show={showDeleteProfileMessage}
          content={
            <DeleteProfile
              profileToDelete={profileToDelete?.id || ''}
              usernameToDelete={profileToDelete?.username || ''}
              onClose={() => {
                setShowDeleteProfileMessage(false);
                setProfileToDelete(null);
              }}
              userProfiles={sortedUserProfiles}
              setIsDeleting={setIsDeleting}
              handleUpdateProfileList={handleUpdateProfileList}
            />
          }
          onClose={() => {
            setShowDeleteProfileMessage(false);
            setProfileToDelete(null);
          }}
        />
      </ul>
    </Pane>
  );
};

export { UserProfileDropdown };
