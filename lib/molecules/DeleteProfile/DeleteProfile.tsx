import cx from 'classnames';
import { useRouter } from 'next/router';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLocalState } from '@/lib/context/state';
import { handleDelete, useDeleteSelectedProfile } from './DeleteProfile.helpers';
import { DeleteProfileProps } from '@/lib/molecules/DeleteProfile/DeleteProfile.types';

const DeleteProfile = ({
  profileToDelete,
  usernameToDelete,
  onClose,
  setIsDeleting,
  userProfiles,
  handleUpdateProfileList,
}: DeleteProfileProps) => {
  const { profileIdMain, usernameMain, setProfileIdMain, setUsernameMain } = useLocalState();

  const router = useRouter();

  const [deleteSelectedProfile] = useDeleteSelectedProfile(profileToDelete);

  return (
    <>
      <Pane>
        <div className={cx('deleteProfileMessage')}>
          <h4>{`Are you sure you want to permanently delete your profile "${usernameToDelete}"?`}</h4>
          <div className={cx('deleteMessageDetails')}>
            <p>{`All data related to this profile will be deleted including:`}</p>
            <ul className={cx('detailsList')}>
              <li>{`Crates`}</li>
              <li>{`Favorites`}</li>
              <li>{`Follower data`}</li>
              <li>{`Following data`}</li>
            </ul>
          </div>
          <p className={cx('deleteMessageNote')}>{`Note: this cannot be undone.`}</p>
          <div className={cx('deleteMessageButtons')}>
            <button type="button" onClick={onClose}>{`Cancel`}</button>
            <button
              type="button"
              onClick={() => {
                handleDelete(
                  profileToDelete,
                  usernameToDelete,
                  profileIdMain,
                  usernameMain,
                  setProfileIdMain,
                  setUsernameMain,
                  onClose,
                  setIsDeleting,
                  userProfiles,
                  handleUpdateProfileList,
                  deleteSelectedProfile,
                  router,
                );
              }}
            >{`Yes, delete ${usernameToDelete}`}</button>
          </div>
        </div>
      </Pane>
    </>
  );
};

export { DeleteProfile };
