import cx from 'classnames';
import { useState, useEffect } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_NOTIFICATIONS_BY_PROFILE } from '@/db/graphql/clientOperations/notification';
import { Notification } from '../Notification/Notification';
import { NotificationsPaneProps } from '@/lib/molecules/NotificationsPane/NotificationsPane.types';

const NotificationsPane = ({ mainProfile, currentUser }: NotificationsPaneProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);

  const {
    error: initialError,
    loading: initialLoading,
    data: initialData,
  } = useQuery(GET_NOTIFICATIONS_BY_PROFILE, {
    variables: {
      currentPage: 1,
      profileId: mainProfile,
      // userId: currentUser,
      userId: 1210,
    },
  });

  const [getMoreNotifications, { loading: loadingMore, data: additionalData }] = useLazyQuery(
    GET_NOTIFICATIONS_BY_PROFILE,
    {
      variables: {
        currentPage: currentPage,
        profileId: mainProfile,
        // userId: currentUser,
        userId: 1210,
      },
    },
  );

  useEffect(() => {
    setNotifications(initialData?.getNotificationsByProfile);
  }, [initialData]);

  useEffect(() => {
    if (additionalData?.getNotificationsByProfile) {
      const newNotifications = additionalData.getNotificationsByProfile.filter(
        newNotification => !notifications.includes(newNotification),
      );

      if (newNotifications.length > 0) {
        setNotifications(prevNotifications => [...prevNotifications, ...newNotifications]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalData]);

  console.log('notifications', notifications);

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
              <Notification
                key={index}
                index={index}
                notificationData={notification}
                mainProfile={mainProfile}
                currentPage={currentPage}
                lastIndex={notifications.length - 1}
                getMoreNotifications={getMoreNotifications}
                setCurrentPage={setCurrentPage}
              />
            ))}
            {loadingMore && (
              <div className={cx('notificationBar')}>
                <h5>{`Loading more notifications...`}</h5>
              </div>
            )}
          </div>
        </Pane>
      ) : null}
    </>
  );
};

export { NotificationsPane };
