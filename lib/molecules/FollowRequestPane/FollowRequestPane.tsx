import cx from 'classnames';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client';
import { Check, X } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import {
  GET_PENDING_FOLLOW_REQUESTS,
  ACCEPT_FOLLOW_REQUEST,
  REJECT_FOLLOW_REQUEST,
} from '@/db/graphql/clientOperations';
import {
  useRejectFollowRequest,
  useAcceptFollowRequest,
  handleAccept,
  handleReject,
} from './FollowRequestPane.helpers';

type FollowRequestPaneProps = {
  mainProfile: number;
};

const FollowRequestPane = ({ mainProfile }: FollowRequestPaneProps) => {
  const { loading, error, data } = useQuery(GET_PENDING_FOLLOW_REQUESTS, {
    variables: { id: mainProfile },
  });

  const followRequestData = data?.getPendingFollowRequests;

  const rejectFollowRequest = useRejectFollowRequest();
  const acceptFollowRequest = useAcceptFollowRequest();

  const handleAcceptEvent = handleAccept(mainProfile, acceptFollowRequest);
  const handleRejectEvent = handleReject(mainProfile, rejectFollowRequest);

  // const [rejectFollowRequest] = useMutation(REJECT_FOLLOW_REQUEST, {
  //   update(cache, { data: { rejectFollowRequest } }) {
  //     cache.evict({ id: cache.identify(rejectFollowRequest) });
  //   },
  // });

  // const [acceptFollowRequest] = useMutation(ACCEPT_FOLLOW_REQUEST, {
  //   update(cache, { data: { acceptFollowRequest } }) {
  //     cache.evict({
  //       id: cache.identify({
  //         __typename: 'FollowRequest',
  //         id: acceptFollowRequest.followRequest.id,
  //       }),
  //     });
  //     cache.gc();

  //     const newFollowerRef = cache.writeFragment({
  //       data: acceptFollowRequest.follow.follower,
  //       fragment: gql`
  //         fragment NewFollower on Profile {
  //           id
  //         }
  //       `,
  //     });

  //     const newFollowingRef = cache.writeFragment({
  //       data: acceptFollowRequest.follow.following,
  //       fragment: gql`
  //         fragment NewFollowing on Profile {
  //           id
  //         }
  //       `,
  //     });

  //     cache.modify({
  //       id: cache.identify({
  //         __typename: 'Profile',
  //         id: acceptFollowRequest.follow.follower.id,
  //       }),
  //       fields: {
  //         following(existingFollowing = []) {
  //           return [...existingFollowing, newFollowingRef];
  //         },
  //       },
  //     });

  //     cache.modify({
  //       id: cache.identify({
  //         __typename: 'Profile',
  //         id: acceptFollowRequest.follow.following.id,
  //       }),
  //       fields: {
  //         followers(existingFollowers = []) {
  //           return [...existingFollowers, newFollowerRef];
  //         },
  //       },
  //     });
  //   },
  // });

  // const handleAccept = event => {
  //   acceptFollowRequest({
  //     variables: {
  //       input: {
  //         follower: Number(event.currentTarget.id),
  //         following: mainProfile,
  //       },
  //     },
  //   });
  // };

  // const handleReject = event => {
  //   rejectFollowRequest({
  //     variables: {
  //       input: {
  //         follower: Number(event.currentTarget.id),
  //         following: mainProfile,
  //       },
  //     },
  //   });
  // };

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
