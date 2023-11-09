import { useQuery, useMutation, gql } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import {
  GET_PROFILE,
  CREATE_NEW_FOLLOW_OR_REQUEST,
  UNFOLLOW_PROFILE,
  GET_PENDING_FOLLOW_REQUESTS,
} from '@/db/graphql/clientOperations';
import { DotsThreeVertical, Gear, User as UserIcon } from '@phosphor-icons/react';
import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import { ProfileForm } from '../ProfileForm/ProfileForm';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { UserSettings } from '../UserSettings/UserSettings';
import { SocialLinkButton } from '../SocialLinkButton/SocialLinkButton';
import Image from 'next/image';
import { ProfilePic } from '../ProfilePic/ProfilePic';

type ProfilePaneProps = {
  username: string;
  mainProfile: number;
  currentUser: number;
  userProfiles: [{ id: number; username: string }];
  handlePaneSelect: (pane: 'followers' | 'following' | 'crates' | 'favorites') => void;
};

const ProfilePane = ({ username, handlePaneSelect, mainProfile, currentUser, userProfiles }: ProfilePaneProps) => {
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { username },
  });
  const profileData = data?.getProfile;
  const { data: followRequestData, refetch: refetchFollowRequests } = useQuery(GET_PENDING_FOLLOW_REQUESTS, {
    variables: { id: profileData?.id },
  });

  const isMain = Boolean(mainProfile === profileData?.id);
  const isUserProfile = userProfiles.some(profile => profile.username === profileData?.username);
  const isFollowing = profileData?.followers.filter(follower => follower.id === mainProfile).length > 0;
  const hasPendingRequest =
    followRequestData?.getPendingFollowRequests.filter(request => request.sender.id === mainProfile).length > 0;
  const isPrivate = profileData?.isPrivate;
  const hidePrivateProfile = isPrivate && !isFollowing;

  // console.log(useApolloClient().cache.extract());

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
          {showEditProfile ? (
            <ProfileForm existingProfileData={profileData} setShowEditProfile={setShowEditProfile} />
          ) : (
            <Pane>
              <div className={cx('headerTop')}>
                <div className={cx('profilePic')}>
                  {profileData.image ? (
                    <ProfilePic username={profileData.username} size={100} />
                  ) : (
                    <UserIcon size={32} />
                  )}
                </div>
                <div className={cx('paneSelectors')}>
                  <button onClick={() => handlePaneSelect('followers')} disabled={hidePrivateProfile}>
                    <p>{`Followers`}</p>
                    <h4>{profileData.followers.length}</h4>
                  </button>
                  <button onClick={() => handlePaneSelect('following')} disabled={hidePrivateProfile}>
                    <p>{`Following`}</p>
                    <h4>{profileData.following.length}</h4>
                  </button>
                  <button onClick={() => handlePaneSelect('crates')} disabled={hidePrivateProfile}>
                    <p>{`Crates`}</p>
                    <h4>{profileData.crates.length}</h4>
                  </button>
                  <button onClick={() => handlePaneSelect('favorites')} disabled={hidePrivateProfile}>
                    <p>{`Favorites`}</p>
                    <h4>{profileData.favorites.length}</h4>
                  </button>
                </div>
              </div>
              <div className={cx('profileInfoMain')}>
                <h1 className={cx('username')}>{profileData.username}</h1>
                <p className={cx('bio')}>{profileData.bio}</p>
              </div>
              <div className={cx('profileButtons')}>
                {isMain && (
                  <button onClick={() => setShowEditProfile(true)}>
                    <p>{`Edit Profile`}</p>
                    <DotsThreeVertical />
                  </button>
                )}
                {isUserProfile && (
                  <button onClick={() => setShowSettings(true)}>
                    <p>{`Settings`}</p>
                    <Gear />
                  </button>
                )}
                {!isMain && !isUserProfile && (
                  <button onClick={() => handleFollowClick(isFollowing)}>
                    {isFollowing ? 'Following' : hasPendingRequest ? 'Requested' : 'Follow'}
                  </button>
                )}
                <SocialLinkButton socialLinks={profileData.socialLinks} />
              </div>
            </Pane>
          )}
          <Modal
            content={<UserSettings userId={currentUser} userProfiles={userProfiles} />}
            title={`Settings`}
            show={showSettings}
            onClose={() => {
              setShowSettings(false);
            }}
          />
        </>
      ) : null}
    </>
  );
};

export { ProfilePane };
