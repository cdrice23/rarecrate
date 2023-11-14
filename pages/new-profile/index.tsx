import { useEffect, useState } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import authed from '@/core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { ProfileForm } from '@/lib/molecules/ProfileForm/ProfileForm';
import { createContext } from '@/db/graphql/context';

interface NewProfileProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
  prismaUserProfiles?: any;
}

const NewProfilePage = ({ userId, email, prismaUserProfiles }: NewProfileProps) => {
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const { setUserId, setEmail } = useLocalState();

  useEffect(() => {
    if (userId) {
      setUserId(userId);
    }

    if (email) {
      setEmail(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, email]);

  return (
    <AuthedLayout userProfiles={prismaUserProfiles}>
      <Pane>
        <h1>{`Create New Profile`}</h1>
      </Pane>
      <Pane>
        <h3>Note: This is the first page a verified user sees to setup a new Profile.</h3>
      </Pane>
      <Pane>
        <h3>{`Local State:`}</h3>
        <p>{`userId (auth): ${userId}`}</p>
        <p>{`email (auth): ${email}`}</p>
      </Pane>
      <ProfileForm userId={userId} imageRefreshKey={imageRefreshKey} setImageRefreshKey={setImageRefreshKey} />
    </AuthedLayout>
  );
};

export default NewProfilePage;

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
