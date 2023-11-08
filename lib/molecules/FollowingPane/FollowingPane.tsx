import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';
import { motion } from 'framer-motion';
import { User as UserIcon } from '@phosphor-icons/react';
import { ProfilePic } from '../ProfilePic/ProfilePic';

type FollowingPaneProps = {
  currentItems: any[];
  getMoreItems: () => void;
};

const FollowingPane = ({ currentItems, getMoreItems }: FollowingPaneProps) => {
  return (
    <Pane>
      {currentItems.map((profile, index) => (
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