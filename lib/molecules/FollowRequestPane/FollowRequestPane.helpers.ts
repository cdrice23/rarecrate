import { useMutation, gql } from '@apollo/client';
import { ACCEPT_FOLLOW_REQUEST, REJECT_FOLLOW_REQUEST } from '@/db/graphql/clientOperations/follow';

export const useRejectFollowRequest = () => {
  const [rejectFollowRequest] = useMutation(REJECT_FOLLOW_REQUEST, {
    update(cache, { data: { rejectFollowRequest } }) {
      cache.evict({ id: cache.identify(rejectFollowRequest) });
    },
  });

  return rejectFollowRequest;
};

export const useAcceptFollowRequest = () => {
  const [acceptFollowRequest] = useMutation(ACCEPT_FOLLOW_REQUEST, {
    update(cache, { data: { acceptFollowRequest } }) {
      cache.evict({
        id: cache.identify({
          __typename: 'FollowRequest',
          id: acceptFollowRequest.followRequest.id,
        }),
      });
      cache.gc();

      const newFollowerRef = cache.writeFragment({
        data: acceptFollowRequest.follow.follower,
        fragment: gql`
          fragment NewFollower on Profile {
            id
          }
        `,
      });

      const newFollowingRef = cache.writeFragment({
        data: acceptFollowRequest.follow.following,
        fragment: gql`
          fragment NewFollowing on Profile {
            id
          }
        `,
      });

      cache.modify({
        id: cache.identify({
          __typename: 'Profile',
          id: acceptFollowRequest.follow.follower.id,
        }),
        fields: {
          following(existingFollowing = []) {
            return [...existingFollowing, newFollowingRef];
          },
        },
      });

      cache.modify({
        id: cache.identify({
          __typename: 'Profile',
          id: acceptFollowRequest.follow.following.id,
        }),
        fields: {
          followers(existingFollowers = []) {
            return [...existingFollowers, newFollowerRef];
          },
        },
      });
    },
  });

  return acceptFollowRequest;
};

export const handleAccept = (mainProfile, acceptFollowRequest) => event => {
  acceptFollowRequest({
    variables: {
      input: {
        follower: Number(event.currentTarget.id),
        following: mainProfile,
      },
    },
  });
};

export const handleReject = (mainProfile, rejectFollowRequest) => event => {
  rejectFollowRequest({
    variables: {
      input: {
        follower: Number(event.currentTarget.id),
        following: mainProfile,
      },
    },
  });
};
