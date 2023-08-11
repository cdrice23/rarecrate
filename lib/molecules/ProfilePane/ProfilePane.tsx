import { useQuery, useMutation, gql } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { GET_PROFILE, CREATE_NEW_FOLLOW_OR_REQUEST, UNFOLLOW_PROFILE } from '@/db/graphql/clientOperations';
import { DotsThreeVertical } from '@phosphor-icons/react';
import { useApolloClient } from '@apollo/client';

type ProfilePaneProps = {
  username: string;
  mainProfile: number;
  handlePaneSelect: (pane: 'followers' | 'following' | 'crates' | 'favorites') => void;
};

const ProfilePane = ({ username, handlePaneSelect, mainProfile }: ProfilePaneProps) => {
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { username },
  });

  const profileData = data?.getProfile;
  const isMain = Boolean(mainProfile === profileData?.id);
  const isFollowing = profileData?.followers.filter(follower => follower.id === mainProfile).length > 0;

  console.log(useApolloClient().cache.extract());

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

        cache.modify({
          id: cache.identify(profileData),
          fields: {
            followers(existingFollowers = []) {
              return [...existingFollowers, newFollowerRef];
            },
          },
        });
      }
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
      }
    },
  });

  const handleFollowClick = isFollowing => {
    if (isFollowing) {
      unfollowProfile({
        variables: {
          input: {
            follower: mainProfile,
            following: profileData?.id,
            followingIsPrivate: profileData?.isPrivate,
          },
        },
      });
    } else {
      createNewFollowOrRequest({
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
        <>
          <Pane>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Profile Data:`}</h3>
              <p>{`Profile ID: ${profileData.id}`}</p>
              <p>{`image: ${profileData.image}`}</p>
              <p>{`Username: ${profileData.username}`}</p>
              <p>{`Profile Type: ${profileData.isPrivate ? 'Private' : 'Public'}`}</p>
              <p>{`Bio: ${profileData.bio}`}</p>
              <ul>
                {profileData.socialLinks.map((link: any) => (
                  <li key={link.id}>{`${link.platform}: ${link.username}`}</li>
                ))}
              </ul>
              {!isMain && (
                <button onClick={() => handleFollowClick(isFollowing)}>{isFollowing ? 'Following' : 'Follow'}</button>
              )}
              {isMain && (
                <button>
                  <p>Edit Profile</p>
                  <DotsThreeVertical />
                </button>
              )}
            </div>
          </Pane>
          <div className={cx('listActions')}>
            <button onClick={() => handlePaneSelect('followers')}>
              <h3>Followers</h3>
              <h4>{profileData.followers.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('following')}>
              <h3>Following</h3>
              <h4>{profileData.following.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('crates')}>
              <h3>Crates</h3>
              <h4>{profileData.crates.length}</h4>
            </button>
            <button onClick={() => handlePaneSelect('favorites')}>
              <h3>Favorites</h3>
              <h4>{profileData.favorites.length}</h4>
            </button>
          </div>
        </>
      ) : null}
    </>
  );
};

export { ProfilePane };
