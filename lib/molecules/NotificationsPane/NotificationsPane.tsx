import { useLazyQuery, useMutation, gql } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_NOTIFICATIONS_BY_PROFILE } from '@/db/graphql/clientOperations';
import { DotsThree, Check, X } from '@phosphor-icons/react';
import { useState } from 'react';

type NotificationsPaneProps = {
  mainProfile: number;
};

const NotificationsPane = ({ mainProfile }: NotificationsPaneProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, { loading, data }] = useLazyQuery(GET_NOTIFICATIONS_BY_PROFILE);

  return (
    <Pane>
      <div className={cx('notificationsPane')}>
        {notifications.map((notification, index) => (
          <div key={index} className={cx('notificationBar')}>
            <p className={cx('type')}>{notification.type}</p>
          </div>
        ))}
      </div>
    </Pane>
  );
};

export { NotificationsPane };
