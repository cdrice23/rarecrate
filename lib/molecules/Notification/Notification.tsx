import cx from 'classnames';
import { Pill } from '@/lib/atoms/Pill/Pill';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Route } from '@/core/enums/routes';
import { User as UserIcon } from '@phosphor-icons/react';

interface NotificationProps {
  index: number;
  notificationData: any;
  mainProfile: number;
  lastIndex: number;
  currentPage: number;
  getMoreNotifications: () => void;
  setCurrentPage: (value: (prevPage: number) => number) => void;
}

const Notification = ({
  index,
  notificationData,
  mainProfile,
  lastIndex,
  currentPage,
  getMoreNotifications,
  setCurrentPage,
}: NotificationProps) => {
  const { type, createdAt } = notificationData;
  // console.log(`${notificationData.id} is index ${index} and last index is ${lastIndex}`);

  const router = useRouter();

  const actionOwnerPath = Route.Profile + `/${notificationData.actionOwner.username}`;
  const handleActionOwnerNav = () => {
    router.push({
      pathname: actionOwnerPath,
    });
  };

  const handleConnectedCrateNav = () => {
    router.push({
      pathname: Route.Profile + `/${notificationData.connectedCrate.creator.username}`,
      query: {
        selectedCrate: notificationData.connectedCrate.id,
      },
    });
  };

  const handleConnectedProfile = () => {
    router.push({
      pathname: Route.Profile + `/${notificationData.connectedFollow.following.username}`,
    });
  };

  switch (type) {
    case 'newCrate':
      return (
        <motion.div
          className={cx('notificationBar')}
          onViewportEnter={async () => {
            if (index === lastIndex) {
              console.log(`You hit the last item!`);
              setCurrentPage(prevPage => prevPage + 1);
              await getMoreNotifications();
            }
          }}
        >
          <div className={cx('notificationBanner')}>
            <div className={cx('image')} onClick={handleActionOwnerNav}>
              <p>{notificationData.actionOwner.image ?? <UserIcon />}</p>
            </div>
            <p className={cx('bannerText')}>
              <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
              {` created a new Crate:`}
            </p>
            <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
          </div>
          <div className={cx('notificationCrateSummary')} onClick={handleConnectedCrateNav}>
            <h3>{notificationData.connectedCrate.title}</h3>
            <p>{notificationData.connectedCrate.description}</p>
            <div className={cx('crateLabels')}>
              {notificationData.connectedCrate.labels.map((label, index) => (
                <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
              ))}
            </div>
          </div>
        </motion.div>
      );
    case 'newFollow':
      if (notificationData.connectedFollow.following.id === mainProfile) {
        return (
          <motion.div
            className={cx('notificationBar')}
            onViewportEnter={async () => {
              if (index === lastIndex) {
                console.log(`You hit the last item!`);
                setCurrentPage(prevPage => prevPage + 1);
                await getMoreNotifications();
              }
            }}
          >
            <div className={cx('notificationBanner')}>
              <div className={cx('image')} onClick={handleActionOwnerNav}>
                <p>{notificationData.actionOwner.image ?? 'P'}</p>
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` started following you.`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
          </motion.div>
        );
      } else {
        return (
          <motion.div
            className={cx('notificationBar')}
            onViewportEnter={async () => {
              if (index === lastIndex) {
                console.log(`You hit the last item!`);
                setCurrentPage(prevPage => prevPage + 1);
                await getMoreNotifications();
              }
            }}
          >
            <div className={cx('notificationBanner')}>
              <div className={cx('image')} onClick={handleActionOwnerNav}>
                <p>{notificationData.actionOwner.image ?? 'P'}</p>
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` started following a new Profile:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationProfileSummary')} onClick={handleConnectedProfile}>
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
          </motion.div>
        );
      }
    case 'newFavorite':
      if (notificationData.connectedCrate.creator.id === mainProfile) {
        return (
          <motion.div
            className={cx('notificationBar')}
            onViewportEnter={async () => {
              if (index === lastIndex) {
                console.log(`You hit the last item!`);
                setCurrentPage(prevPage => prevPage + 1);
                await getMoreNotifications();
              }
            }}
          >
            <div className={cx('notificationBanner')}>
              <div className={cx('image')} onClick={handleActionOwnerNav}>
                <p>{notificationData.actionOwner.image ?? 'P'}</p>
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` favorited your Crate:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationCrateSummary')} onClick={handleConnectedCrateNav}>
              <h3>{notificationData.connectedCrate.title}</h3>
              <p>{notificationData.connectedCrate.description}</p>
              <div className={cx('crateLabels')}>
                {notificationData.connectedCrate.labels.map((label, index) => (
                  <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
                ))}
              </div>
            </div>
          </motion.div>
        );
      } else {
        return (
          <motion.div
            className={cx('notificationBar')}
            onViewportEnter={async () => {
              if (index === lastIndex) {
                console.log(`You hit the last item!`);
                setCurrentPage(prevPage => prevPage + 1);
                await getMoreNotifications();
              }
            }}
          >
            <div className={cx('notificationBanner')}>
              <div className={cx('image')} onClick={handleActionOwnerNav}>
                <p>{notificationData.actionOwner.image ?? 'P'}</p>
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` favorited a new Crate:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div className={cx('notificationCrateSummary')} onClick={handleConnectedCrateNav}>
              <h3>{notificationData.connectedCrate.title}</h3>
              <p>{notificationData.connectedCrate.description}</p>
              <div className={cx('crateLabels')}>
                {notificationData.connectedCrate.labels.map((label, index) => (
                  <Pill key={index} name={label.name} style={label.isStandard ? 'standardLabel' : 'uniqueLabel'} />
                ))}
              </div>
            </div>
          </motion.div>
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
