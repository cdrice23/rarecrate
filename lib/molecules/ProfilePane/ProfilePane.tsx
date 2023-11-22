import cx from 'classnames';
import { useState } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { DotsThreeVertical, Gear, User as UserIcon } from '@phosphor-icons/react';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { GET_PROFILE, GET_PENDING_FOLLOW_REQUESTS } from '@/db/graphql/clientOperations';
import { ProfileForm } from '../ProfileForm/ProfileForm';
import { UserSettings } from '../UserSettings/UserSettings';
import { SocialLinkButton } from '../SocialLinkButton/SocialLinkButton';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import { useFollowMutations, handleFollowClick } from './ProfilePane.helpers';
import { ProfilePaneProps } from '@/types/molecules/ProfilePane.types';

const ProfilePane = ({
  username,
  handlePaneSelect,
  mainProfile,
  currentUser,
  userProfiles,
  imageRefreshKey,
  setImageRefreshKey,
}: ProfilePaneProps) => {
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

  const { createNewFollowOrRequest, unfollowProfile } = useFollowMutations(
    mainProfile,
    profileData,
    refetchFollowRequests,
  );

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
            <ProfileForm
              key={imageRefreshKey}
              existingProfileData={profileData}
              setShowEditProfile={setShowEditProfile}
              imageRefreshKey={imageRefreshKey}
              setImageRefreshKey={setImageRefreshKey}
            />
          ) : (
            <Pane>
              <div className={cx('headerTop')}>
                <div className={cx('profilePic')}>
                  {profileData.image ? (
                    <ProfilePic key={Number(imageRefreshKey)} username={profileData.username} size={100} />
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
                  <button
                    onClick={async isFollowing =>
                      handleFollowClick(
                        isFollowing,
                        mainProfile,
                        profileData,
                        unfollowProfile,
                        createNewFollowOrRequest,
                      )
                    }
                  >
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
