import cx from 'classnames';
import { useEffect, useState, useReducer, useRef } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { useRouter } from 'next/router';
import { useQuery, useLazyQuery } from '@apollo/client';
import authed from '@/core/helpers/authed';
import { Route } from '@/core/enums/routes';
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
  GET_USERNAME_BY_ID,
  GET_PROFILE,
  GET_PROFILE_FOLLOWERS,
  GET_PROFILE_FOLLOWING,
  GET_PROFILE_CRATES,
  GET_PROFILE_FAVORITES,
} from '@/db/graphql/clientOperations/profile';
import { GET_LAST_LOGIN_PROFILE } from '@/db/graphql/clientOperations/user';

interface ProfileProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  prismaUserProfiles?: any;
}

const initialResultsState = {
  follower: { results: [], currentPage: 1 },
  following: { results: [], currentPage: 1 },
  crate: { results: [], currentPage: 1 },
  favorite: { results: [], currentPage: 1 },
};

const resultsReducer = (state, action) => {
  const keys = ['follower', 'following', 'crate', 'favorite'];
  const key = keys.find(key => action.type.toLowerCase().includes(key));

  if (key) {
    if (action.type.includes('RESULTS')) {
      return {
        ...state,
        [key]: {
          ...state[key],
          results: Array.isArray(action.payload) ? [...state[key].results, ...action.payload] : [...state[key].results],
        },
      };
    } else if (action.type.includes('CURRENT_PAGE')) {
      return { ...state, [key]: { ...state[key], currentPage: action.payload } };
    } else if (action.type.includes('RESET')) {
      return { ...state, [key]: { results: [], currentPage: 1 } };
    } else if (action.type.includes('TOGGLE')) {
      console.log(action.type);
      const objectKey = action.type.includes('CRATE') ? 'crate' : 'favorite';
      const id = action.type.match(/\d+/)[0];
      const status = action.type.includes('TRUE') ? 'TRUE' : 'FALSE';
      const results = state[objectKey].results.map(item => {
        if (item.id === Number(id)) {
          if (status === 'TRUE') {
            return {
              ...item,
              favoritedBy: [...item.favoritedBy, { __typename: 'Profile', id: action.payload }],
            };
          } else {
            return {
              ...item,
              favoritedBy: item.favoritedBy.filter(profile => profile.id !== action.payload),
            };
          }
        }
        return item;
      });
      console.log(objectKey);
      return {
        ...state,
        [objectKey]: { ...state[objectKey], results },
      };
    }
  }

  return state;
};

const ProfilePage = ({ userId, email, prismaUserProfiles }: ProfileProps) => {
  const [resultsState, dispatch] = useReducer(resultsReducer, initialResultsState);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [activePane, setActivePane] = useState<'followers' | 'following' | 'crates' | 'favorites'>('crates');
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();

  const router = useRouter();

  console.log(resultsState);
  const currentProfile = Array.isArray(router.query.username) ? router.query.username[0] : router.query.username;
  const currentFollowers = resultsState.follower.results;
  const currentFollowing = resultsState.following.results;
  const currentCrates = resultsState.crate.results;
  const currentFavorites = resultsState.favorite.results;

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
              currentPage: resultsState.follower.currentPage,
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
              currentPage: resultsState.following.currentPage,
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
              currentPage: resultsState.crate.currentPage,
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
              currentPage: resultsState.favorite.currentPage,
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
          currentPage: resultsState.crate.currentPage,
        },
      });
    }

    if (followersData?.getProfileFollowers && activePane === 'followers') {
      dispatch({ type: 'UPDATE_FOLLOWER_RESULTS', payload: followersData.getProfileFollowers });
      dispatch({
        type: 'UPDATE_FOLLOWER_CURRENT_PAGE',
        payload: resultsState.follower.currentPage + 1,
      });
    }

    if (followedProfilesData?.getProfileFollowing && activePane === 'following') {
      dispatch({ type: 'UPDATE_FOLLOWING_RESULTS', payload: followedProfilesData.getProfileFollowing });
      dispatch({
        type: 'UPDATE_FOLLOWING_CURRENT_PAGE',
        payload: resultsState.following.currentPage + 1,
      });
    }

    if (cratesData?.getProfileCrates && activePane === 'crates') {
      dispatch({ type: 'UPDATE_CRATE_RESULTS', payload: cratesData.getProfileCrates });
      dispatch({
        type: 'UPDATE_CRATE_CURRENT_PAGE',
        payload: resultsState.crate.currentPage + 1,
      });
    }

    if (favoritesData?.getProfileFavorites && activePane === 'favorites') {
      dispatch({ type: 'UPDATE_FAVORITE_RESULTS', payload: favoritesData.getProfileFavorites });
      dispatch({
        type: 'UPDATE_FAVORITE_CURRENT_PAGE',
        payload: resultsState.favorite.currentPage + 1,
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
                  {currentFollowers.length > 0 && (
                    <FollowerPane
                      currentItems={currentFollowers}
                      getMoreItems={() => {
                        getFollowers({
                          variables: {
                            username: currentProfile,
                            currentPage: resultsState.follower.currentPage,
                          },
                        });
                      }}
                    />
                  )}
                </div>
              )
            : activePane === 'following'
            ? !hidePrivateProfile && (
                <div className={cx('paneSectionFull')}>
                  {currentFollowing.length > 0 && (
                    <FollowingPane
                      currentItems={currentFollowing}
                      getMoreItems={() => {
                        getFollowedProfiles({
                          variables: {
                            username: currentProfile,
                            currentPage: resultsState.following.currentPage,
                          },
                        });
                      }}
                    />
                  )}
                </div>
              )
            : activePane === 'crates'
            ? !hidePrivateProfile &&
              currentCrates.length > 0 && (
                <CrateSummaryPane
                  currentItems={currentCrates}
                  username={currentProfile}
                  mainProfile={profileIdMain}
                  userProfiles={prismaUserProfiles}
                  getMoreItems={() => {
                    getCrates({
                      variables: {
                        username: currentProfile,
                        currentPage: resultsState.crate.currentPage,
                      },
                    });
                  }}
                  imageRefreshKey={imageRefreshKey}
                  dispatch={dispatch}
                />
              )
            : !hidePrivateProfile &&
              currentFavorites.length > 0 && (
                <FavoriteSummaryPane
                  currentItems={currentFavorites}
                  username={currentProfile}
                  mainProfile={profileIdMain}
                  userProfiles={prismaUserProfiles}
                  getMoreItems={() => {
                    getFavorites({
                      variables: {
                        username: currentProfile,
                        currentPage: resultsState.favorite.currentPage,
                      },
                    });
                  }}
                  dispatch={dispatch}
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
