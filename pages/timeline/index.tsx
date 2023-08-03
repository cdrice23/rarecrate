import { useEffect } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthedLayout } from '@/lib/layouts/Authed';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { createContext } from '@/db/graphql/context';
import { useQuery } from '@apollo/client';

import authed from '../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_PROFILE_BY_ID, HELLO_WORLD } from '@/db/graphql/clientQueries';

interface TimelineProps {
  userId?: number;
  email?: string;
  profileId?: string;
  username?: string;
}

const TimelinePage = ({ userId, email, profileId, username }: TimelineProps) => {
  const { setUserId, setEmail, setProfileId, setUsername } = useLocalState();
  const { loading, error, data } = useQuery(GET_PROFILE_BY_ID, {
    variables: { userId: 1208 },
  });
  const userProfiles = data?.getProfileById;

  console.log(userProfiles?.[0].username || 'Waiting');

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }

    if (email) {
      setEmail(email);
    }
    // if (!loading && !error && data) {
    //   if (!profileId) {
    //     setProfileId(data.getProfileById.id);
    //   }

    //   if (!username) {
    //     setUsername(data.getProfileById.username);
    //   }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email, loading, error, data]);

  return (
    <AuthedLayout>
      {!loading && !error && userProfiles && (
        <>
          <h1>{`Hi, ${userProfiles[0].username} - this is the Crate Digging Page!`}</h1>
          <p>{`Your profileId is ${userProfiles[0].id}`}</p>
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
