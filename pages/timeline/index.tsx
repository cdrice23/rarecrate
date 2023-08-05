import { useEffect } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { createContext } from '@/db/graphql/context';
import { useQuery } from '@apollo/client';

import authed from '../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_USERNAME_BY_ID } from '@/db/graphql/clientQueries';

interface TimelineProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
}

const TimelinePage = ({ userId, email }: TimelineProps) => {
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();
  const { loading, error, data } = useQuery(GET_USERNAME_BY_ID, {
    // real variable to get authed user
    // variables: { userId },
    variables: { userId: 1298 },
  });

  console.log(error);

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
    <AuthedLayout usernameMain={usernameMain}>
      {error ? (
        <>
          <h1>Error</h1>
          <p>{error.message}</p>
        </>
      ) : loading ? (
        <h1>Loading...</h1>
      ) : profileIdMain && usernameMain ? (
        <>
          <h1>{`Timeline`}</h1>
          <div>
            <h3>{`Local State:`}</h3>
            <p>{`userId (auth): ${userId}`}</p>
            <p>{`email (auth): ${email}`}</p>
            <p>{`Main Profile Id: ${profileIdMain}`}</p>
            <p>{`Main Profile Username: ${usernameMain}`}</p>
          </div>
          <h3>Note: This will be the first page upon login.</h3>
        </>
      ) : null}
    </AuthedLayout>
  );
};

export default TimelinePage;

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
