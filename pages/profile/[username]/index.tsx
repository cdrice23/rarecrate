import cx from 'classnames';
import { useEffect, useState, useReducer, useRef } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useLazyQuery } from '@apollo/client';
import authed from '@/core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { FollowerPane } from '@/lib/molecules/FollowerPane/FollowerPane';
import { FollowingPane } from '@/lib/molecules/FollowingPane/FollowingPane';
import { CrateSummaryPane } from '@/lib/molecules/CrateSummaryPane/CrateSummaryPane';
import { FavoriteSummaryPane } from '@/lib/molecules/FavoriteSummaryPane/FavoriteSummaryPane';
import { ProfilePane } from '@/lib/molecules/ProfilePane/ProfilePane';
import { createContext } from '@/db/graphql/context';
import {
  GET_LAST_LOGIN_PROFILE,
  GET_PROFILE,
  GET_PROFILE_FOLLOWERS,
  GET_PROFILE_FOLLOWING,
  GET_PROFILE_CRATES,
  GET_PROFILE_FAVORITES,
} from '@/db/graphql/clientOperations';

interface ProfileProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  prismaUserProfiles?: any;
}

const initialResultsState = {
  followerState: { results: [], currentPage: 1 },
  followingState: { results: [], currentPage: 1 },
  crateState: { results: [], currentPage: 1 },
  favoriteState: { results: [], currentPage: 1 },
};

const resultsReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FOLLOWER_RESULTS':
      return {
        ...state,
        followerState: { ...state.followerState, results: [...state.followerState.results, ...action.payload] },
      };
    case 'UPDATE_FOLLOWING_RESULTS':
      return {
        ...state,
        followingState: { ...state.followingState, results: [...state.followingState.results, ...action.payload] },
      };
    case 'UPDATE_CRATE_RESULTS':
      return {
        ...state,
        crateState: { ...state.crateState, results: [...state.crateState.results, ...action.payload] },
      };
    case 'UPDATE_FAVORITE_RESULTS':
      return {
        ...state,
        favoriteState: { ...state.favoriteState, results: [...state.favoriteState.results, ...action.payload] },
      };
    case 'UPDATE_FOLLOWER_CURRENT_PAGE':
      return { ...state, followerState: { ...state.followerState, currentPage: action.payload } };
    case 'UPDATE_FOLLOWING_CURRENT_PAGE':
      return { ...state, followingState: { ...state.followingState, currentPage: action.payload } };
    case 'UPDATE_CRATE_CURRENT_PAGE':
      return { ...state, crateState: { ...state.crateState, currentPage: action.payload } };
    case 'UPDATE_FAVORITE_CURRENT_PAGE':
      return { ...state, favoriteState: { ...state.favoriteState, currentPage: action.payload } };
    case 'RESET_FOLLOWER_RESULTS':
      return { ...state, followerState: { results: [], currentPage: 1 } };
    case 'RESET_FOLLOWING_RESULTS':
      return { ...state, followingState: { results: [], currentPage: 1 } };
    case 'RESET_CRATE_RESULTS':
      return { ...state, crateState: { results: [], currentPage: 1 } };
    case 'RESET_FAVORITE_RESULTS':
      return { ...state, favoriteState: { results: [], currentPage: 1 } };
    default:
      return state;
  }
};

const ProfilePage = ({ userId, email, prismaUserProfiles }: ProfileProps) => {
  const [resultsState, dispatch] = useReducer(resultsReducer, initialResultsState);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [activePane, setActivePane] = useState<'followers' | 'following' | 'crates' | 'favorites'>('crates');
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();

  const router = useRouter();

  const currentProfile = Array.isArray(router.query.username) ? router.query.username[0] : router.query.username;
  const currentFollowers = resultsState.followerState.results;
  const currentFollowing = resultsState.followingState.results;
  const currentCrates = resultsState.crateState.results;
  const currentFavorites = resultsState.favoriteState.results;

  const prevProfile = useRef(currentProfile);

  // profile data of the user
  const { loading, error, data } = useQuery(GET_LAST_LOGIN_PROFILE, {
    // real variable to get authed user
    variables: { userId },
    // variables: { userId: 1286 },
  });

  // profile data of the current profile
  const { data: currentProfileData } = useQuery(GET_PROFILE, {
    variables: {
      username: currentProfile,
    },
  });
  const [getFollowers, { data: followersData }] = useLazyQuery(GET_PROFILE_FOLLOWERS);
  const [getFollowedProfiles, { data: followedProfilesData }] = useLazyQuery(GET_PROFILE_FOLLOWING);
  const [getCrates, { data: cratesData }] = useLazyQuery(GET_PROFILE_CRATES);
  const [getFavorites, { data: favoritesData }] = useLazyQuery(GET_PROFILE_FAVORITES);

  const handlePaneSelect = (pane: 'followers' | 'following' | 'crates' | 'favorites') => {
    switch (pane) {
      case 'followers':
        if (currentFollowers.length === 0) {
          getFollowers({
            variables: {
              username: currentProfile,
              currentPage: resultsState.followerState.currentPage,
            },
          });
        }
        dispatch({ type: 'RESET_FOLLOWING_RESULTS' });
        dispatch({ type: 'RESET_CRATE_RESULTS' });
        dispatch({ type: 'RESET_FAVORITE_RESULTS' });
        break;
      case 'following':
        if (currentFollowing.length === 0) {
          getFollowedProfiles({
            variables: {
              username: currentProfile,
              currentPage: resultsState.followingState.currentPage,
            },
          });
        }
        dispatch({ type: 'RESET_FOLLOWER_RESULTS' });
        dispatch({ type: 'RESET_CRATE_RESULTS' });
        dispatch({ type: 'RESET_FAVORITE_RESULTS' });
        break;
      case 'crates':
        if (currentCrates.length === 0) {
          getCrates({
            variables: {
              username: currentProfile,
              currentPage: resultsState.crateState.currentPage,
            },
          });
        }
        dispatch({ type: 'RESET_FOLLOWER_RESULTS' });
        dispatch({ type: 'RESET_FOLLOWING_RESULTS' });
        dispatch({ type: 'RESET_FAVORITE_RESULTS' });
        break;
      case 'favorites':
        if (currentFavorites.length === 0) {
          getFavorites({
            variables: {
              username: currentProfile,
              currentPage: resultsState.favoriteState.currentPage,
            },
          });
        }
        dispatch({ type: 'RESET_FOLLOWER_RESULTS' });
        dispatch({ type: 'RESET_FOLLOWING_RESULTS' });
        dispatch({ type: 'RESET_CRATE_RESULTS' });
        break;
      default:
        break;
    }
    setActivePane(pane);
  };

  const isFollowing =
    currentProfileData?.getProfile.followers.filter(follower => follower.id === profileIdMain).length > 0;
  const isPrivate = currentProfileData?.getProfile.isPrivate;
  const hidePrivateProfile = isPrivate && !isFollowing;

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }

    if (email) {
      setEmail(email);
    }

    // const userProfiles = data?.getUsernameById;
    const lastLoginProfile = data?.getLastLoginProfile;

    if (!loading && !error && lastLoginProfile) {
      if (!profileIdMain) {
        setProfileIdMain(lastLoginProfile.id);
      }

      if (!usernameMain) {
        setUsernameMain(lastLoginProfile.username);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email, loading, error, data]);

  useEffect(() => {
    if (currentCrates.length === 0) {
      getCrates({
        variables: {
          username: currentProfile,
          currentPage: resultsState.crateState.currentPage,
        },
      });
    }

    if (followersData?.getProfileFollowers && activePane === 'followers') {
      dispatch({ type: 'UPDATE_FOLLOWER_RESULTS', payload: followersData.getProfileFollowers });
      dispatch({
        type: 'UPDATE_FOLLOWER_CURRENT_PAGE',
        payload: resultsState.followerState.currentPage + 1,
      });
    }

    if (followedProfilesData?.getProfileFollowing && activePane === 'following') {
      dispatch({ type: 'UPDATE_FOLLOWING_RESULTS', payload: followedProfilesData.getProfileFollowing });
      dispatch({
        type: 'UPDATE_FOLLOWING_CURRENT_PAGE',
        payload: resultsState.followingState.currentPage + 1,
      });
    }

    if (cratesData?.getProfileCrates && activePane === 'crates') {
      dispatch({ type: 'UPDATE_CRATE_RESULTS', payload: cratesData.getProfileCrates });
      dispatch({
        type: 'UPDATE_CRATE_CURRENT_PAGE',
        payload: resultsState.crateState.currentPage + 1,
      });
    }

    if (favoritesData?.getProfileFavorites && activePane === 'favorites') {
      dispatch({ type: 'UPDATE_FAVORITE_RESULTS', payload: favoritesData.getProfileFavorites });
      dispatch({
        type: 'UPDATE_FAVORITE_CURRENT_PAGE',
        payload: resultsState.favoriteState.currentPage + 1,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePane, followersData, followedProfilesData, cratesData, favoritesData]);

  useEffect(() => {
    if (prevProfile.current !== currentProfile) {
      router.reload();
    }
    prevProfile.current = currentProfile;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  return (
    <AuthedLayout userProfiles={prismaUserProfiles}>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : profileIdMain && usernameMain ? (
        <>
          <h1 className={cx('pane')}>{`Profile`}</h1>
          <Pane>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Local State:`}</h3>
              <p>{`userId (auth): ${userId}`}</p>
              <p>{`email (auth): ${email}`}</p>
              <p>{`Main Profile Id: ${profileIdMain}`}</p>
              <p>{`Main Profile Username: ${usernameMain}`}</p>
            </div>
          </Pane>
          <ProfilePane
            username={currentProfile}
            handlePaneSelect={handlePaneSelect}
            mainProfile={profileIdMain}
            currentUser={userId}
            userProfiles={prismaUserProfiles}
            imageRefreshKey={imageRefreshKey}
            setImageRefreshKey={setImageRefreshKey}
          />
          {activePane === 'followers'
            ? !hidePrivateProfile && (
                <div className={cx('paneSectionFull')}>
                  <FollowerPane
                    currentItems={currentFollowers}
                    getMoreItems={() => {
                      getFollowers({
                        variables: {
                          username: currentProfile,
                          currentPage: resultsState.followerState.currentPage,
                        },
                      });
                    }}
                  />
                </div>
              )
            : activePane === 'following'
            ? !hidePrivateProfile && (
                <div className={cx('paneSectionFull')}>
                  <FollowingPane
                    currentItems={currentFollowing}
                    getMoreItems={() => {
                      getFollowedProfiles({
                        variables: {
                          username: currentProfile,
                          currentPage: resultsState.followingState.currentPage,
                        },
                      });
                    }}
                  />
                </div>
              )
            : activePane === 'crates'
            ? !hidePrivateProfile && (
                <CrateSummaryPane
                  currentItems={currentCrates}
                  username={currentProfile}
                  mainProfile={profileIdMain}
                  userProfiles={prismaUserProfiles}
                  getMoreItems={() => {
                    getCrates({
                      variables: {
                        username: currentProfile,
                        currentPage: resultsState.crateState.currentPage,
                      },
                    });
                  }}
                  imageRefreshKey={imageRefreshKey}
                />
              )
            : !hidePrivateProfile && (
                <FavoriteSummaryPane
                  currentItems={currentFavorites}
                  username={currentProfile}
                  mainProfile={profileIdMain}
                  userProfiles={prismaUserProfiles}
                  getMoreItems={() => {
                    getFavorites({
                      variables: {
                        username: currentProfile,
                        currentPage: resultsState.favoriteState.currentPage,
                      },
                    });
                  }}
                />
              )}
        </>
      ) : null}
    </AuthedLayout>
  );
};

export default ProfilePage;

export const getServerSideProps = authed(async context => {
  const ctx = await createContext(context.req as NextApiRequest, context.res as NextApiResponse);
  const { prismaUser, auth0User } = ctx;

  return {
    props: {
      userId: prismaUser.id,
      prismaUserProfiles: prismaUser.profiles.map(profile => ({ id: profile.id, username: profile.username })),
      email: auth0User.email,
    },
  };
});
