import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import { useLocalState } from '@/lib/context/state';
import { useMutation } from '@apollo/client';
import { DELETE_PROFILE, GET_PROFILE } from '@/db/graphql/clientOperations';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';
import { gql } from '@apollo/client';

interface DeleteProfileProps {
  profileToDelete: number;
  usernameToDelete: string;
  userProfiles: [{ id: number; username: string }];
  onClose: () => void;
  setIsDeleting: (value) => void;
  handleUpdateProfileList: (deletedProfile: number) => void;
}

const DeleteProfile = ({
  profileToDelete,
  usernameToDelete,
  onClose,
  setIsDeleting,
  userProfiles,
  handleUpdateProfileList,
}: DeleteProfileProps) => {
  const [deleteSelectedProfile] = useMutation(DELETE_PROFILE, {
    variables: { profileId: profileToDelete },
    update(cache, { data }) {
      const deletedProfileData = cache.readFragment({
        id: `Profile:${profileToDelete}`,
        fragment: gql`
          fragment DeletedProfile on Profile {
            id
            crates {
              id
            }
          }
        `,
      }) as { id: string; crates: { id: string }[] };

      // Evict the Profile object from the cache
      cache.evict({ id: `Profile:${profileToDelete}` });

      // Evict the Crates objects from the cache
      deletedProfileData.crates.forEach(crate => {
        cache.evict({ id: `Crate:${crate.id}` });
      });

      // Run garbage collection to clean up any unreachable objects
      cache.gc();
    },
  });
  const { profileIdMain, usernameMain } = useLocalState();

  const router = useRouter();

  const handleDelete = async () => {
    if (profileToDelete === profileIdMain) {
      // Check if userProfiles > 1, if so, switch to next profile and push to page, otherwise, push to createNewProfile screen
      console.log(`You are deleting the mainProfile, ${usernameToDelete}`);
    } else {
      // Delete profile, don't push to new page
      console.log(`You are deleting a profile (${usernameToDelete}) that isn't the main one (${profileIdMain})`);
      setIsDeleting(true);
      onClose();
      router.push(Route.Profile + `/${usernameMain}`);
      try {
        await deleteSelectedProfile();
      } catch (error) {
        console.error('Error deleting profile:', error);
      } finally {
        handleUpdateProfileList(profileToDelete);
        setIsDeleting(false);
      }
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
