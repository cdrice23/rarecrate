import cx from 'classnames';

interface NotificationProps {
  notificationData: any;
  mainProfile: number;
}

const Notification = ({ notificationData, mainProfile }: NotificationProps) => {
  const { type, actionOwner } = notificationData;
  switch (type) {
    case 'newCrate':
      return (
        <div className={cx('notificationBar')}>
          <p className={cx('type')}>Someone created a new crate</p>
        </div>
      );
    case 'newFollow':
      if (notificationData.connectedFollow.followingId === mainProfile) {
        return (
          <div className={cx('notificationBar')}>
            <p className={cx('type')}>Someone followed you</p>
          </div>
        );
      } else {
        return (
          <div className={cx('notificationBar')}>
            <p className={cx('type')}>Someone you follow followed a new profile</p>
          </div>
        );
      }
    case 'newFavorite':
      if (notificationData.connectedCrate.creatorId === mainProfile) {
        return (
          <div className={cx('notificationBar')}>
            <p className={cx('type')}>Someone favorited your crate</p>
          </div>
        );
      } else {
        return (
          <div className={cx('notificationBar')}>
            <p className={cx('type')}>Someone you follow favorited a new crate</p>
          </div>
        );
      }
    default:
      return null;
  }
};

export { Notification };
