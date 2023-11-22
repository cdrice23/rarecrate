import cx from 'classnames';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { DeleteAccountProps } from '@/types/molecules/DeleteAccount.types';

const DeleteAccount = ({ onClose, userProfiles }: DeleteAccountProps) => {
  const router = useRouter();

  const handleDelete = async () => {
    // Redirect the user to the logout route
    router.push({
      pathname: Route.DeleteAccount,
      query: { deleteAccount: 'true' },
    });
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
