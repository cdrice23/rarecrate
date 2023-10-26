import { useEffect, useState } from 'react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';
import { motion } from 'framer-motion';

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
            <p className={cx('image')}>{profile.following.image ?? 'P'}</p>
            <p className={cx('username')}>{profile.following.username}</p>
          </LinkButton>
        </motion.div>
      ))}
    </Pane>
  );
};

export { FollowingPane };
