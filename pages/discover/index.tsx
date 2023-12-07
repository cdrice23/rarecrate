import { useEffect, useState } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { useQuery } from '@apollo/client';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { createContext } from '@/db/graphql/context';
import authed from '../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_USERNAME_BY_ID } from '@/db/graphql/clientOperations/profile';
import { GET_LAST_LOGIN_PROFILE } from '@/db/graphql/clientOperations/user';
import { CrateDiggingPane } from '@/lib/molecules/CrateDiggingPane/CrateDiggingPane';
import { GlobalSearch } from '@/lib/molecules/GlobalSearch/GlobalSearch';

interface DiscoverProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  prismaUserProfiles?: any;
}

const DiscoverPage = ({ userId, email, prismaUserProfiles }: DiscoverProps) => {
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain, profileIdMain, usernameMain } = useLocalState();
  // const { loading, error, data } = useQuery(GET_USERNAME_BY_ID, {
  //   // real variable to get authed user
  //   variables: { userId },
  //   // variables: { userId: 1286 },
  // });

  console.log(showSearchResults);

  const { loading, error, data } = useQuery(GET_LAST_LOGIN_PROFILE, {
    // real variable to get authed user
    variables: { userId },
    // variables: { userId: 1210 },
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
          <GlobalSearch showSearchResults={showSearchResults} setShowSearchResults={setShowSearchResults} />
          {showSearchResults === false && (
            <CrateDiggingPane mainProfile={profileIdMain} userProfiles={prismaUserProfiles} />
          )}
        </>
      ) : null}
    </AuthedLayout>
  );
};

export default DiscoverPage;

export const getServerSideProps = authed(async context => {
  const ctx = await createContext(context.req as NextApiRequest, context.res as NextApiResponse);
  const { prismaUser, auth0User } = ctx;

  console.log(auth0User);

  return {
    props: {
      userId: prismaUser.id,
      prismaUserProfiles: prismaUser.profiles.map(profile => profile.id),
      email: auth0User.email,
    },
  };
});
