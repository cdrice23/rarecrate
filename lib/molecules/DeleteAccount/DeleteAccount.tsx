import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import { useLocalState } from '@/lib/context/state';
import { useMutation } from '@apollo/client';
import { DELETE_PROFILE, DELETE_USER } from '@/db/graphql/clientOperations';
import { useRouter } from 'next/router';
import { PublicRoute } from '@/core/enums/routes';
import axios from 'axios';

interface DeleteAccountProps {
  userProfiles: Array<{ id: number; username: string } | { isAddProfile: boolean }>;
  onClose: () => void;
}

const DeleteAccount = ({ onClose, userProfiles }: DeleteAccountProps) => {
  const [deleteSelectedProfile] = useMutation(DELETE_PROFILE);
  const [deleteUser] = useMutation(DELETE_USER);
  const { userId } = useLocalState();

  const router = useRouter();

  const handleDelete = async () => {
    // Redirect the user to the logout route
    router.push(PublicRoute.Logout);

    // Cycle through each profile id in userProfiles and trigger deleteSelectedProfile
    for (const profile of userProfiles) {
      if ('id' in profile) {
        await deleteSelectedProfile({ variables: { id: profile.id } });
      }
    }

    // Trigger the deleteUser mutation with variable userId as userId from LocalState
    await deleteUser({ variables: { id: userId } });

    // Hit the deleteUser API endpoint to delete the Auth0 user
    try {
      const response = await axios.delete('/api/deleteUser');
      if (response.status === 200) {
        // Redirect the user to the login page after deleting their account
        console.log('Account deleted.');
      }
    } catch (error) {
      // Handle the error
      console.error('Failed to delete user', error);
    }
  };

  return (
    <>
      <Pane>
        <div className={cx('deleteProfileMessage')}>
          <h4>{`Are you sure you want to permanently delete your account?`}</h4>
          <div className={cx('deleteMessageDetails')}>
            <p>{`All data related to this account will be deleted including:`}</p>
            <ul className={cx('detailsList')}>
              <li>{`Your Rare Crate user account and settings`}</li>
              <li>{`All Profile data (Crates, Favorites, follower data, following data)`}</li>
              <li>{`Your Auth0 user`}</li>
            </ul>
          </div>
          <p
            className={cx('deleteMessageNote')}
          >{`Note: this cannot be undone. You will need to sign-up again to create a new account.`}</p>
          <div className={cx('deleteMessageButtons')}>
            <button type="button" onClick={onClose}>{`Cancel`}</button>
            <button type="button" onClick={handleDelete}>{`Yes, delete my account`}</button>
          </div>
        </div>
      </Pane>
    </>
  );
};

export { DeleteAccount };
