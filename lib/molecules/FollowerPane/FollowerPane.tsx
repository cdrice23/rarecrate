import { useEffect, useState } from 'react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLazyQuery } from '@apollo/client';
import { GET_PROFILE_FOLLOWERS } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';

type FollowerPaneProps = {
  username: string;
};

const FollowerPane = ({ username }: FollowerPaneProps) => {
  const [currentFollowers, setCurrentFollowers] = useState([]);
  const [currentFollowersPage, setCurrentFollowersPage] = useState<number>(1);
  const [getFollowers, { loading: loadingFollowers, error: errorFollowers, data: followersData }] =
    useLazyQuery(GET_PROFILE_FOLLOWERS);

  useEffect(() => {
    if (currentFollowers.length === 0) {
      getFollowers({
        variables: {
          username: username,
          currentPage: currentFollowersPage,
        },
      });
    }

    if (followersData?.getProfileFollowers) {
      setCurrentFollowers(prevFollowers => [...prevFollowers, ...followersData.getProfileFollowers]);
      // setCurrentFollowersPage(currentFollowersPage + 1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followersData]);

  return (
    <Pane>
      {errorFollowers ? (
        <>
          <h1>Error</h1>
          <p>{errorFollowers.message}</p>
        </>
      ) : loadingFollowers ? (
        <>
          <h1>Loading...</h1>
        </>
      ) : followersData ? (
        <>
          <div>
            {currentFollowers.map((profile, index) => (
              <LinkButton
                href={Route.Profile + `/${profile.follower.username}`}
                key={index}
                className={cx('profileBar')}
              >
                <p className={cx('image')}>{profile.follower.image ?? 'P'}</p>
                <p className={cx('username')}>{profile.follower.username}</p>
              </LinkButton>
            ))}
          </div>
        </>
      ) : null}
    </Pane>
  );
};

export { FollowerPane };
