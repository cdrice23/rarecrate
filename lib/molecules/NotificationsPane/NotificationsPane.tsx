import { useLazyQuery, useQuery } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_NOTIFICATIONS_BY_PROFILE } from '@/db/graphql/clientOperations';
import { DotsThree, Check, X } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { Notification } from '../Notification/Notification';

interface NotificationsPaneProps {
  mainProfile: number;
  currentUser: number;
}

const NotificationsPane = ({ mainProfile, currentUser }: NotificationsPaneProps) => {
  const [currentPage, setCurrentPage] = useState(2);
  const [notifications, setNotifications] = useState([]);
  const {
    error: initialError,
    loading: initialLoading,
    data: initialData,
  } = useQuery(GET_NOTIFICATIONS_BY_PROFILE, {
    variables: {
      currentPage: 2,
      profileId: mainProfile,
      userId: currentUser,
    },
  });
  const [getMoreNotifications, { loading: loadingMore, data: additionalData }] =
    useLazyQuery(GET_NOTIFICATIONS_BY_PROFILE);

  useEffect(() => {
    setNotifications(initialData?.getNotificationsByProfile);
    setCurrentPage(2);
  }, [initialData]);

  console.log(notifications);

  return (
    <>
      {initialError ? (
        <>
          <h1>Error</h1>
          <p>{initialError.message}</p>
        </>
      ) : initialLoading ? (
        <h1>Loading...</h1>
      ) : initialData ? (
        <Pane>
          <div className={cx('notificationsPane')}>
            {notifications?.map((notification, index) => (
              <Notification key={index} notificationData={notification} mainProfile={mainProfile} />
            ))}
          </div>
        </Pane>
      ) : null}
    </>
  );
};

export { NotificationsPane };
