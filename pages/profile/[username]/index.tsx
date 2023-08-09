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
import { ProfilePane } from '@/lib/molecules/ProfilePane/ProfilePane';

import authed from '../../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_USERNAME_BY_ID } from '@/db/graphql/clientQueries';

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
  const { loading, error, data } = useQuery(GET_USERNAME_BY_ID, {
    // real variable to get authed user
    // variables: { userId },
    variables: { userId: 1208 },
  });

  console.log(profileIdMain);

  const handlePaneSelect = (pane: 'followers' | 'following' | 'crates' | 'favorites') => {
    setActivePane(pane);
  };

  const currentProfile = Array.isArray(router.query.username) ? router.query.username[0] : router.query.username;

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
          <ProfilePane username={currentProfile} handlePaneSelect={handlePaneSelect} mainProfile={profileIdMain} />
          {activePane === 'followers' ? (
            <div className={cx('paneSectionFull')}>
              <FolloweringPane username={currentProfile} listType="followers" />
            </div>
          ) : activePane === 'following' ? (
            <div className={cx('paneSectionFull')}>
              <FolloweringPane username={currentProfile} listType="following" />
            </div>
          ) : activePane === 'crates' ? (
            <CrateSummaryPane username={currentProfile} listType="crates" mainProfile={profileIdMain} />
          ) : (
            <CrateSummaryPane username={currentProfile} listType="favorites" mainProfile={profileIdMain} />
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
