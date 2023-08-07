import { useEffect, useState } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { createContext } from '@/db/graphql/context';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { FolloweringPane } from '@/lib/molecules/FolloweringPane/FolloweringPane';
import { CrateSummaryPane } from '@/lib/molecules/CrateSummaryPane/CrateSummaryPane';

import authed from '../../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_MAIN_PROFILE } from '@/db/graphql/clientQueries';

interface ProfileProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
}

const ProfilePage = ({ userId, email }: ProfileProps) => {
  const router = useRouter();
  const [activePane, setActivePane] = useState<'followers' | 'following' | 'crates' | 'favorites'>('followers');
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();
  const { loading, error, data } = useQuery(GET_MAIN_PROFILE, {
    // real variable to get authed user
    // variables: { userId },
    variables: { userId: 1208, username: router.query.username },
  });

  const profileData = data?.getProfile;
  console.log(profileData);

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }

    if (email) {
      setEmail(email);
    }

    const userProfiles = data?.getUsernameById;

    if (!loading && !error && userProfiles) {
      if (!profileIdMain) {
        setProfileIdMain(userProfiles[0].id);
      }

      if (!usernameMain) {
        setUsernameMain(userProfiles[0].username);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email, loading, error, data]);

  return (
    <AuthedLayout>
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
          <Pane>
            <div className={cx('paneSectionFull')}>
              <h3 className={cx('sectionTitle')}>{`Profile Data:`}</h3>
              <p>{`Profile ID: ${profileData.id}`}</p>
              <p>{`image: ${profileData.image}`}</p>
              <p>{`Username: ${profileData.username}`}</p>
              <p>{`Profile Type: ${profileData.isPrivate ? 'Private' : 'Public'}`}</p>
              <p>{`Bio: ${profileData.bio}`}</p>
              <ul>
                {profileData.socialLinks.map(link => (
                  <li key={link.id}>{`${link.platform}: ${link.username}`}</li>
                ))}
              </ul>
            </div>
          </Pane>
          <div className={cx('listActions')}>
            <button onClick={() => setActivePane('followers')}>
              <h3>Followers</h3>
              <h4>{profileData.followers.length}</h4>
            </button>
            <button onClick={() => setActivePane('following')}>
              <h3>Following</h3>
              <h4>{profileData.following.length}</h4>
            </button>
            <button onClick={() => setActivePane('crates')}>
              <h3>Crates</h3>
              <h4>{profileData.crates.length}</h4>
            </button>
            <button onClick={() => setActivePane('favorites')}>
              <h3>Favorites</h3>
              <h4>{profileData.favorites.length}</h4>
            </button>
          </div>
          {activePane === 'followers' ? (
            <div className={cx('paneSectionFull')}>
              <FolloweringPane username={profileData.username} listType="followers" />
            </div>
          ) : activePane === 'following' ? (
            <div className={cx('paneSectionFull')}>
              <FolloweringPane username={profileData.username} listType="following" />
            </div>
          ) : activePane === 'crates' ? (
            <CrateSummaryPane username={profileData.username} listType="crates" />
          ) : (
            <CrateSummaryPane username={profileData.username} listType="favorites" />
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
      email: auth0User.email,
    },
  };
});
