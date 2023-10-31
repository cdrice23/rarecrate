import { Pane } from '@/lib/atoms/Pane/Pane';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';
import { motion } from 'framer-motion';
import { User as UserIcon } from '@phosphor-icons/react';

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
            <p className={cx('image')}>{profile.follower.image ?? <UserIcon />}</p>
            <p className={cx('username')}>{profile.follower.username}</p>
          </LinkButton>
        </motion.div>
      ))}
    </Pane>
  );
};

export { FollowerPane };
