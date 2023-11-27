import cx from 'classnames';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { User as UserIcon } from '@phosphor-icons/react';
import { Route } from '@/core/enums/routes';
import { Pill } from '@/lib/atoms/Pill/Pill';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import {
  handleActionOwnerNav,
  handleConnectedCrateNav,
  handleConnectedProfile,
  calculateTime,
  displayTime,
} from './Notification.helpers';
import { NotificationProps } from '@/lib/molecules/Notification/Notification.types';

const Notification = ({
  index,
  notificationData,
  mainProfile,
  lastIndex,
  getMoreNotifications,
  setCurrentPage,
}: NotificationProps) => {
  const { type, createdAt } = notificationData;

  const router = useRouter();

  const actionOwnerPath = Route.Profile + `/${notificationData.actionOwner.username}`;

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
            <div
              className={cx('image')}
              onClick={() => handleActionOwnerNav(router, notificationData.actionOwner.username)}
            >
              {notificationData.actionOwner.image ? (
                <ProfilePic username={notificationData.actionOwner.username} size={36} />
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <p className={cx('bannerText')}>
              <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
              {` created a new Crate:`}
            </p>
            <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
          </div>
          <div
            className={cx('notificationCrateSummary')}
            onClick={() =>
              handleConnectedCrateNav(
                router,
                notificationData.connectedCrate.creator.username,
                notificationData.connectedCrate.id,
              )
            }
          >
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
              <div
                className={cx('image')}
                onClick={() => handleActionOwnerNav(router, notificationData.actionOwner.username)}
              >
                {notificationData.actionOwner.image ? (
                  <ProfilePic username={notificationData.actionOwner.username} size={36} />
                ) : (
                  <UserIcon size={16} />
                )}
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
              <div
                className={cx('image')}
                onClick={() => handleActionOwnerNav(router, notificationData.actionOwner.username)}
              >
                {notificationData.actionOwner.image ? (
                  <ProfilePic username={notificationData.actionOwner.username} size={36} />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` started following a new Profile:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div
              className={cx('notificationProfileSummary')}
              onClick={() => handleConnectedProfile(router, notificationData.connectedFollow.following.username)}
            >
              <div className={cx('profileBanner')}>
                <div className={cx('image')}>
                  {notificationData.connectedFollow.following.image ? (
                    <ProfilePic username={notificationData.connectedFollow.following.username} size={36} />
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
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
              <div
                className={cx('image')}
                onClick={() => handleActionOwnerNav(router, notificationData.actionOwner.username)}
              >
                {notificationData.actionOwner.image ? (
                  <ProfilePic username={notificationData.actionOwner.username} size={36} />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` favorited your Crate:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div
              className={cx('notificationCrateSummary')}
              onClick={() =>
                handleConnectedCrateNav(
                  router,
                  notificationData.connectedCrate.creator.username,
                  notificationData.connectedCrate.id,
                )
              }
            >
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
              <div
                className={cx('image')}
                onClick={() => handleActionOwnerNav(router, notificationData.actionOwner.username)}
              >
                {notificationData.actionOwner.image ? (
                  <ProfilePic username={notificationData.actionOwner.username} size={36} />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <p className={cx('bannerText')}>
                <a href={actionOwnerPath}>{notificationData.actionOwner.username}</a>
                {` favorited a new Crate:`}
              </p>
              <p className={cx('timestamp')}>{displayTime(calculateTime(new Date(createdAt).toLocaleString()))}</p>
            </div>
            <div
              className={cx('notificationCrateSummary')}
              onClick={() =>
                handleConnectedCrateNav(
                  router,
                  notificationData.connectedCrate.creator.username,
                  notificationData.connectedCrate.id,
                )
              }
            >
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
