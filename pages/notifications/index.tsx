import { useEffect } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { useQuery } from '@apollo/client';
import authed from '@/core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { FollowRequestPane } from '@/lib/molecules/FollowRequestPane/FollowRequestPane';
import { NotificationsPane } from '@/lib/molecules/NotificationsPane/NotificationsPane';
import { createContext } from '@/db/graphql/context';
import { GET_USERNAME_BY_ID, GET_LAST_LOGIN_PROFILE } from '@/db/graphql/clientOperations';

interface NotificationsProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  prismaUserProfiles?: any;
}

const NotificationsPage = ({ userId, email, prismaUserProfiles }: NotificationsProps) => {
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();
  // const { loading, error, data } = useQuery(GET_USERNAME_BY_ID, {
  //   // real variable to get authed user
  //   // variables: { userId },
  //   variables: { userId: 1286 },
  // });

  const { loading, error, data } = useQuery(GET_LAST_LOGIN_PROFILE, {
    // real variable to get authed user
    variables: { userId },
    // variables: { userId: 1286 },
  });

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
          <Pane>
            <h1>{`Notifications`}</h1>
          </Pane>
          <Pane>
            <h3>{`Local State:`}</h3>
            <p>{`userId (auth): ${userId}`}</p>
            <p>{`email (auth): ${email}`}</p>
            <p>{`Main Profile Id: ${profileIdMain}`}</p>
            <p>{`Main Profile Username: ${usernameMain}`}</p>
          </Pane>
          <FollowRequestPane mainProfile={profileIdMain} />
          <NotificationsPane mainProfile={profileIdMain} currentUser={userId} />
        </>
      ) : null}
    </AuthedLayout>
  );
};

export default NotificationsPage;

export const getServerSideProps = authed(async context => {
  const ctx = await createContext(context.req as NextApiRequest, context.res as NextApiResponse);
  const { prismaUser, auth0User } = ctx;

  return {
    props: {
      userId: prismaUser.id,
      prismaUserProfiles: prismaUser.profiles.map(profile => profile.id),
      email: auth0User.email,
    },
  };
});
