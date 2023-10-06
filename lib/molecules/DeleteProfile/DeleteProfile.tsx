import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import { useLocalState } from '@/lib/context/state';

interface DeleteProfileProps {
  usernameToDelete: string;
  userProfiles: [{ id: number; username: string }];
  onClose: () => void;
}

const DeleteProfile = ({ usernameToDelete, onClose, userProfiles }) => {
  const { usernameMain } = useLocalState();

  console.log(userProfiles);

  const handleDelete = () => {
    if (usernameToDelete === usernameMain) {
      // Check if userProfiles > 1, if so, switch to next profile and push to page, otherwise, push to createNewProfile screen
      console.log(`You are deleting the mainProfile, ${usernameToDelete}`);
    } else {
      // Delete profile, don't push to new page
      console.log(`You are deleting a profile (${usernameToDelete}) that isn't the main one (${usernameMain})`);
    }
  };

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
            <button type="button" onClick={handleDelete}>{`Yes, delete ${usernameToDelete}`}</button>
          </div>
        </div>
      </Pane>
    </>
  );
};

export { DeleteProfile };
