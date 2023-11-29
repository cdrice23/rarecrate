import cx from 'classnames';
import { useQuery } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { Check, X } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { FollowRequestPaneProps } from '@/lib/molecules/FollowRequestPane/FollowRequestPane.types';
import { GET_PENDING_FOLLOW_REQUESTS } from '@/db/graphql/clientOperations/follow';
import {
  useRejectFollowRequest,
  useAcceptFollowRequest,
  handleAccept,
  handleReject,
} from './FollowRequestPane.helpers';

const FollowRequestPane = ({ mainProfile }: FollowRequestPaneProps) => {
  const { loading, error, data } = useQuery(GET_PENDING_FOLLOW_REQUESTS, {
    variables: { id: mainProfile },
  });

  const followRequestData = data?.getPendingFollowRequests;

  const rejectFollowRequest = useRejectFollowRequest();
  const acceptFollowRequest = useAcceptFollowRequest();

  const handleAcceptEvent = handleAccept(mainProfile, acceptFollowRequest);
  const handleRejectEvent = handleReject(mainProfile, rejectFollowRequest);

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
                  <button id={profile.sender.id} onClick={handleAcceptEvent}>
                    <Check />
                  </button>
                  <button id={profile.sender.id} onClick={handleRejectEvent}>
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
