import cx from 'classnames';
import { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { useQuery, useMutation } from '@apollo/client';
import { Message } from '@/lib/atoms/Message/Message';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_NOTIFICATION_SETTINGS_BY_USER, UPDATE_NOTIFICATION_SETTINGS } from '@/db/graphql/clientOperations';
import { UserProfileDropdown } from '../UserProfileDropdown/UserProfileDropdown';
import { DeleteAccount } from '../DeleteAccount/DeleteAccount';
import { onSubmit } from './UserSettings.helpers';

const UserSettings = ({ userId, userProfiles }) => {
  const [showDeleteAccount, setShowDeleteAccount] = useState<boolean>(false);
  const { loading, error, data } = useQuery(GET_NOTIFICATION_SETTINGS_BY_USER, {
    variables: { userId },
  });
  const [updateNotificationSettings] = useMutation(UPDATE_NOTIFICATION_SETTINGS);

  const notificationSettings = data?.getNotificationSettingsByUser;

  return (
    <>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : data ? (
        <Pane>
          <Formik
            initialValues={notificationSettings}
            onSubmit={(values, actions) => onSubmit(values, actions, userId, updateNotificationSettings)}
          >
            {({ values, isSubmitting, initialValues }) => {
              return (
                <Form className={cx('pane')}>
                  <div className={cx('paneSectionFull')}>
                    <h3 className={cx('sectionTitle')}>{`Notification Settings:`}</h3>
                    <div className={cx('notificationSettings')}>
                      <div className={cx('formInputItem')}>
                        <Field name="showOwnNewFollowers" type="checkbox" />
                        <label htmlFor="showOwnNewFollowers">Notify when someone follows me</label>
                      </div>
                      <div className={cx('formInputItem')}>
                        <Field name="showOwnNewFavorites" type="checkbox" />
                        <label htmlFor="showOwnNewFavorites">Notify when someone favorites my Crate</label>
                      </div>
                      <div className={cx('formInputItem')}>
                        <Field name="showFollowingNewFollows" type="checkbox" />
                        <label htmlFor="showFollowingNewFollows">
                          Notify when a profile I follow follows a new profile
                        </label>
                      </div>
                      <div className={cx('formInputItem')}>
                        <Field name="showFollowingNewCrates" type="checkbox" />
                        <label htmlFor="showFollowingNewCrates">
                          Notify when a profile I follow creates/updates a Crate
                        </label>
                      </div>
                      <div className={cx('formInputItem')}>
                        <Field name="showFollowingNewFavorites" type="checkbox" />
                        <label htmlFor="showFollowingNewFavorites">
                          Notify when a profile I follow favorites a Crate
                        </label>
                      </div>
                    </div>
                    <div>
                      <button type="submit" disabled={isSubmitting}>
                        Save Notification Settings
                      </button>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Pane>
      ) : null}
      <UserProfileDropdown userProfiles={userProfiles} />
      <Pane>
        <div className={cx('noNoWrapper')}>
          <button type="button" onClick={() => setShowDeleteAccount(true)} className={cx('noNoButton')}>
            {`Permanently delete Account`}
          </button>
        </div>
      </Pane>
      {showDeleteAccount && (
        <Message
          title={'Confirm delete account'}
          show={showDeleteAccount}
          content={<DeleteAccount userProfiles={userProfiles} onClose={() => setShowDeleteAccount(false)} />}
          onClose={() => {
            setShowDeleteAccount(false);
          }}
        />
      )}
    </>
  );
};

export { UserSettings };
