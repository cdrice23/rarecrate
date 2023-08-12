import { useQuery, useMutation, gql } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_PENDING_FOLLOW_REQUESTS } from '@/db/graphql/clientOperations';
import { DotsThree, Check, X } from '@phosphor-icons/react';
import { useApolloClient } from '@apollo/client';

type FollowRequestPaneProps = {
  mainProfile: number;
};

const FollowRequestPane = ({ mainProfile }: FollowRequestPaneProps) => {
  const { loading, error, data } = useQuery(GET_PENDING_FOLLOW_REQUESTS, {
    variables: { id: mainProfile },
  });

  const followRequestData = data?.getPendingFollowRequests;
  console.log(followRequestData);

  // console.log(useApolloClient().cache.extract());

  return (
    <>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : data ? (
        <Pane>
          <div className={cx('followRequestPane')}>
            {followRequestData.map((profile, index) => (
              <div key={index} className={cx('profileBar')}>
                <p className={cx('image')}>{profile.sender.image ?? 'P'}</p>
                <p className={cx('username')}>{profile.sender.username}</p>
                <div className={cx('buttons')}>
                  <button>
                    <Check />
                  </button>
                  <button>
                    <X />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Pane>
      ) : null}
    </>
  );
};

export { FollowRequestPane };
