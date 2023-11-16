import { useMutation, gql } from '@apollo/client';
import { CREATE_NEW_FOLLOW_OR_REQUEST, UNFOLLOW_PROFILE } from '@/db/graphql/clientOperations';

export const handleFollowClick = async (
  isFollowing,
  mainProfile,
  profileData,
  unfollowProfile,
  createNewFollowOrRequest,
) => {
  if (isFollowing) {
    await unfollowProfile({
      variables: {
        input: {
          follower: mainProfile,
          following: profileData?.id,
          followingIsPrivate: profileData?.isPrivate,
        },
      },
    });
  } else {
    await createNewFollowOrRequest({
      variables: {
        input: {
          follower: mainProfile,
          following: profileData?.id,
          followingIsPrivate: profileData?.isPrivate,
        },
      },
    });
  }
};

export const useFollowMutations = (mainProfile, profileData, refetchFollowRequests) => {
  const [createNewFollowOrRequest] = useMutation(CREATE_NEW_FOLLOW_OR_REQUEST, {
    update: (cache, { data }) => {
      const newFollow = data?.createNewFollowOrRequest?.follow;

      if (newFollow) {
        const newFollowerRef = cache.writeFragment({
          data: newFollow.follower,
          fragment: gql`
            fragment NewFollower on Profile {
              id
            }
          `,
        });

        const newFollowingRef = cache.writeFragment({
          data: newFollow.following,
          fragment: gql`
            fragment NewFollowing on Profile {
              id
            }
          `,
        });

        cache.modify({
          id: cache.identify(profileData),
          fields: {
            followers(existingFollowers = []) {
              return [...existingFollowers, newFollowerRef];
            },
          },
        });

        cache.modify({
          id: cache.identify({
            __typename: 'Profile',
            id: mainProfile,
          }),
          fields: {
            following(existingFollowing = []) {
              return [...existingFollowing, newFollowingRef];
            },
          },
        });
      }

      refetchFollowRequests();
    },
  });

  const [unfollowProfile] = useMutation(UNFOLLOW_PROFILE, {
    update: (cache, { data }) => {
      const unfollowedProfile = data?.unfollowProfile;

      if (unfollowedProfile) {
        cache.modify({
          id: cache.identify(profileData),
          fields: {
            followers(existingFollowers = [], { readField }) {
              return existingFollowers.filter(
                followerRef => unfollowedProfile.followerId !== readField('id', followerRef),
              );
            },
          },
        });

        cache.modify({
          id: cache.identify({
            __typename: 'Profile',
            id: mainProfile,
          }),
          fields: {
            following(existingFollowing = [], { readField }) {
              return existingFollowing.filter(
                followingRef => unfollowedProfile.followingId !== readField('id', followingRef),
              );
            },
          },
        });
      }
    },
  });

  return { createNewFollowOrRequest, unfollowProfile };
};
