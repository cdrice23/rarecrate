import { useEffect, useState } from 'react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { useLazyQuery } from '@apollo/client';
import { GET_PROFILE_FOLLOWING } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';

type FollowingPaneProps = {
  username: string;
};

const FollowingPane = ({ username }: FollowingPaneProps) => {
  const [currentFollowedProfiles, setCurrentFollowedProfiles] = useState([]);
  const [currentFollowedProfilesPage, setCurrentFollowedProfilesPage] = useState<number>(1);
  const [
    getFollowedProfiles,
    { loading: loadingFollowedProfiles, error: errorFollowedProfiles, data: followedProfilesData },
  ] = useLazyQuery(GET_PROFILE_FOLLOWING);

  useEffect(() => {
    if (currentFollowedProfiles.length === 0) {
      getFollowedProfiles({
        variables: {
          username: username,
          currentPage: currentFollowedProfilesPage,
        },
      });
    }

    if (followedProfilesData?.getProfileFollowing) {
      setCurrentFollowedProfiles(prevProfiles => [...prevProfiles, ...followedProfilesData.getProfileFollowing]);
      // setCurrentFollowedProfilesPage(currentFollowedProfilesPage + 1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedProfilesData]);

  return (
    <Pane>
      {errorFollowedProfiles ? (
        <>
          <h1>Error</h1>
          <p>{errorFollowedProfiles.message}</p>
        </>
      ) : loadingFollowedProfiles ? (
        <>
          <h1>Loading...</h1>
        </>
      ) : followedProfilesData ? (
        <>
          <Pane>
            {currentFollowedProfiles.map((profile, index) => (
              <LinkButton
                href={Route.Profile + `/${profile.following.username}`}
                key={index}
                className={cx('profileBar')}
              >
                <p className={cx('image')}>{profile.following.image ?? 'P'}</p>
                <p className={cx('username')}>{profile.following.username}</p>
              </LinkButton>
            ))}
          </Pane>
        </>
      ) : null}
    </Pane>
  );
};

export { FollowingPane };
