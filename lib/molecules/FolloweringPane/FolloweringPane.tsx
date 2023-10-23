import { Pane } from '@/lib/atoms/Pane/Pane';
import { useQuery } from '@apollo/client';
import { GET_PROFILE_FOLLOWERINGS } from '@/db/graphql/clientOperations';
import cx from 'classnames';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route } from '@/core/enums/routes';

type FolloweringPaneProps = {
  username: string;
  listType: 'followers' | 'following';
};

const FolloweringPane = ({ username, listType }: FolloweringPaneProps) => {
  const { loading, error, data } = useQuery(GET_PROFILE_FOLLOWERINGS, {
    variables: { username: username },
  });

  console.log('profileFollowerings', data);
  const followeringData = data?.getProfile;

  return (
    <Pane>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : followeringData ? (
        listType === 'followers' ? (
          <>
            <div>
              <h3>Followers:</h3>
            </div>
            <div>
              {followeringData.followers.map((profile, index) => (
                <LinkButton href={Route.Profile + `/${profile.username}`} key={index} className={cx('profileBar')}>
                  <p className={cx('image')}>{profile.image ?? 'P'}</p>
                  <p className={cx('username')}>{profile.username}</p>
                </LinkButton>
              ))}
            </div>
          </>
        ) : (
          <>
            <Pane>
              <h3>Following:</h3>
            </Pane>
            <Pane>
              {followeringData.following.map((profile, index) => (
                <LinkButton href={Route.Profile + `/${profile.username}`} key={index} className={cx('profileBar')}>
                  <p className={cx('image')}>{profile.image ?? 'P'}</p>
                  <p className={cx('username')}>{profile.username}</p>
                </LinkButton>
              ))}
            </Pane>
          </>
        )
      ) : null}
    </Pane>
  );
};

export { FolloweringPane };
