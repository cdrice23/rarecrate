import cx from 'classnames';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
import { DotsThreeVertical, Gear, User as UserIcon, SignOut, Bell } from '@phosphor-icons/react';
import { PublicRoute, Route } from '@/core/enums/routes';
import { useLocalState } from '@/lib/context/state';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { Modal } from '@/lib/atoms/Modal/Modal';
import { ProfilePaneProps } from '@/lib/molecules/ProfilePane/ProfilePane.types';
import { GET_PROFILE } from '@/db/graphql/clientOperations/profile';
import { GET_PENDING_FOLLOW_REQUESTS } from '@/db/graphql/clientOperations/follow';
import { UPDATE_LAST_LOGIN_PROFILE } from '@/db/graphql/clientOperations/user';
import { ProfileForm } from '../ProfileForm/ProfileForm';
import { UserSettings } from '../UserSettings/UserSettings';
import { SocialLinkButton } from '../SocialLinkButton/SocialLinkButton';
import { ProfilePic } from '../ProfilePic/ProfilePic';
import { useFollowMutations, handleFollowClick } from './ProfilePane.helpers';

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
  const [updateLastLoginProfile] = useMutation(UPDATE_LAST_LOGIN_PROFILE);
  const { userId, profileIdMain, resetState } = useLocalState();

  const router = useRouter();

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

  const handleLogout = async () => {
    resetState();
    await updateLastLoginProfile({ variables: { userId, profileId: profileIdMain } });
    router.push(PublicRoute.Logout);
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
                {isMain && (
                  <button
                    onClick={() => {
                      router.push(Route.Notifications);
                    }}
                  >
                    <p>{`Notifications`}</p>
                    <Bell />
                  </button>
                )}
                {isMain && (
                  <button onClick={handleLogout}>
                    <p>{`Sign Out`}</p>
                    <SignOut />
                  </button>
                )}
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
