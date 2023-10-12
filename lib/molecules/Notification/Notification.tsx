import cx from 'classnames';
import { Pill } from '@/lib/atoms/Pill/Pill';

interface NotificationProps {
  notificationData: any;
  mainProfile: number;
}

const Notification = ({ notificationData, mainProfile }: NotificationProps) => {
  const { type, createdAt } = notificationData;

  switch (type) {
    case 'newCrate':
      return (
        <div className={cx('notificationBar')}>
          <div className={cx('notificationBanner')}>
            <p className={cx('image')}>{notificationData.connectedCrate.creator.image ?? 'P'}</p>
            <p className={cx('bannerText')}>
              {`${notificationData.connectedCrate.creator.username} created a new Crate:`}
            </p>
            <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
          </div>
          <div className={cx('notificationCrateSummary')}>
            <h3>{notificationData.connectedCrate.title}</h3>
            <p>{notificationData.connectedCrate.description}</p>
            <div className={cx('crateLabels')}>
              {notificationData.connectedCrate.labels.map((label, index) => (
                <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
              ))}
            </div>
          </div>
        </div>
      );
    case 'newFollow':
      if (notificationData.connectedFollow.following.id === mainProfile) {
        return (
          <div className={cx('notificationBar')}>
            <div className={cx('notificationBanner')}>
              <p className={cx('image')}>{notificationData.actionOwner.image ?? 'P'}</p>
              <p className={cx('bannerText')}>{`${notificationData.actionOwner.username} started following you.`}</p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
          </div>
        );
      } else {
        return (
          <div className={cx('notificationBar')}>
            <div className={cx('notificationBanner')}>
              <p className={cx('image')}>{notificationData.actionOwner.image ?? 'P'}</p>
              <p
                className={cx('bannerText')}
              >{`${notificationData.actionOwner.username} started following a new Profile:`}</p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationProfileSummary')}>
              <div className={cx('profileBanner')}>
                <p className={cx('image')}>{notificationData.connectedFollow.following.image ?? 'P'}</p>
                <div className={cx('profileHeader')}>
                  <h3>{notificationData.connectedFollow.following.username}</h3>
                  <p>{notificationData.connectedFollow.following.bio}</p>
                </div>
              </div>
              <div className={cx('profileDetails')}>
                <p>{`${notificationData.connectedFollow.following.followers.length} Followers`}</p>
                <p>{`${notificationData.connectedFollow.following.following.length} Following`}</p>
                <p>{`${notificationData.connectedFollow.following.crates.length} Crates`}</p>
                <p>{`${notificationData.connectedFollow.following.favorites.length} Favorites`}</p>
              </div>
            </div>
          </div>
        );
      }
    case 'newFavorite':
      if (notificationData.connectedCrate.creator.id === mainProfile) {
        return (
          <div className={cx('notificationBar')}>
            <div className={cx('notificationBanner')}>
              <p className={cx('image')}>{notificationData.actionOwner.image ?? 'P'}</p>
              <p className={cx('bannerText')}>{`${notificationData.actionOwner.username} favorited your Crate:`}</p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationCrateSummary')}>
              <h3>{notificationData.connectedCrate.title}</h3>
              <p>{notificationData.connectedCrate.description}</p>
              <div className={cx('crateLabels')}>
                {notificationData.connectedCrate.labels.map((label, index) => (
                  <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
                ))}
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className={cx('notificationBar')}>
            <div className={cx('notificationBanner')}>
              <p className={cx('image')}>{notificationData.actionOwner.image ?? 'P'}</p>
              <p className={cx('bannerText')}>{`${notificationData.actionOwner.username} favorited a new Crate:`}</p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationCrateSummary')}>
              <h3>{notificationData.connectedCrate.title}</h3>
              <p>{notificationData.connectedCrate.description}</p>
              <div className={cx('crateLabels')}>
                {notificationData.connectedCrate.labels.map((label, index) => (
                  <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
                ))}
              </div>
            </div>
          </div>
        );
      }
    default:
      return null;
  }
};

export { Notification };

function calculateTime(createdDate: string) {
  const currentDate = new Date();
  const createdDateTime = new Date(createdDate);
  const diffTime = Math.abs(currentDate.valueOf() - createdDateTime.valueOf());

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  return { diffDays, diffHours, diffMinutes };
}

function displayTime({
  diffDays,
  diffHours,
  diffMinutes,
}: {
  diffDays: number;
  diffHours: number;
  diffMinutes: number;
}) {
  if (diffDays >= 7) {
    const weeks = Math.ceil(diffDays / 7);
    return `${weeks}w`;
  } else if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minutes ago`;
  } else {
    return 'just now';
  }
}
