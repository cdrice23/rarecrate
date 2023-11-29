import cx from 'classnames';
import { motion } from 'framer-motion';
import { User as UserIcon } from '@phosphor-icons/react';
import { Route } from '@/core/enums/routes';
import { Pane } from '@/lib/atoms/Pane/Pane';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { FollowingPaneProps } from '@/lib/molecules/FollowingPane/FollowingPane.types';
import { ProfilePic } from '../ProfilePic/ProfilePic';

const FollowingPane = ({ currentItems, getMoreItems }: FollowingPaneProps) => {
  return (
    <Pane>
      {currentItems.length > 0 &&
        currentItems.map((profile, index) => (
          <motion.div
            key={index}
            onViewportEnter={() => {
              if (index === currentItems.length - 1) {
                console.log('you hit the last item!');
                getMoreItems();
              }
            }}
          >
            <LinkButton href={Route.Profile + `/${profile.following.username}`} className={cx('profileBar')}>
              <div className={cx('image')}>
                {profile.following.image ? (
                  <ProfilePic username={profile.following.username} size={36} />
                ) : (
                  <UserIcon size={32} />
                )}
              </div>
              <p className={cx('username')}>{profile.following.username}</p>
            </LinkButton>
          </motion.div>
        ))}
    </Pane>
  );
};

export { FollowingPane };
