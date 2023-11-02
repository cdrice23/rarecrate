import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';
import { motion } from 'framer-motion';
import { User as UserIcon } from '@phosphor-icons/react';
import useSignedUrl from '@/core/hooks/useSignedUrl';
import Image from 'next/image';
import { ProfilePic } from '../ProfilePic/ProfilePic';

type FollowerPaneProps = {
  currentItems: any[];
  getMoreItems: () => void;
};

const FollowerPane = ({ currentItems, getMoreItems }: FollowerPaneProps) => {
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
          <LinkButton href={Route.Profile + `/${profile.follower.username}`} className={cx('profileBar')}>
            {/* <div className={cx('image')}>
              {profile.follower.image ? (
                <ProfilePic username={profile.follower.username} size={36} />
              ) : (
                <UserIcon size={32} />
              )}
            </div> */}
            <p className={cx('username')}>{profile.follower.username}</p>
          </LinkButton>
        </motion.div>
      ))}
    </Pane>
  );
};

export { FollowerPane };
