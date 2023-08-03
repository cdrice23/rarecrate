import { useEffect } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { createContext } from '@/db/graphql/context';
import { useQuery } from '@apollo/client';

import authed from '../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_PROFILE_BY_ID } from '@/db/graphql/clientQueries';

interface TimelineProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
}

const TimelinePage = ({ userId, email }: TimelineProps) => {
  const { setUserId, setEmail, setProfileId, setUsername, profileId, username } = useLocalState();
  const { loading, error, data } = useQuery(GET_PROFILE_BY_ID, {
    variables: { userId: 1208 },
  });
  const userProfiles = data?.getProfileById;

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }

    if (email) {
      setEmail(email);
    }
    if (!loading && !error && userProfiles) {
      if (!profileId) {
        setProfileId(userProfiles[0].id);
      }

      if (!username) {
        setUsername(userProfiles[0].username);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email, loading, error, data]);

  return (
    <AuthedLayout>
      {!loading && !error && profileId && username && (
        <>
          <h1>{`Hi, ${username} - this is the Crate Digging Page!`}</h1>
          <p>{`Your profileId is ${profileId}`}</p>
        </>
      )}
      <p>This will be the first page upon login.</p>
      <LinkButton href="/api/auth/logout">Logout of Rare Crate</LinkButton>
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
