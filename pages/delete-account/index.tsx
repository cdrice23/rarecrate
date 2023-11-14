import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextApiRequest, NextApiResponse } from 'next';
import { useMutation } from '@apollo/client';
import authed from '../../core/helpers/authed';
import { PublicRoute, Route } from '@/core/enums/routes';
import { useLocalState } from '@/lib/context/state';
import { Pane } from '@/lib/atoms/Pane/Pane';
import { createContext } from '@/db/graphql/context';
import { DELETE_PROFILE, DELETE_USER } from '@/db/graphql/clientOperations';

interface DeleteAccountPageProps {
  userId?: number;
  prismaUserProfiles?: any;
}

const DeleteAccountPage = ({ userId, prismaUserProfiles }: DeleteAccountPageProps) => {
  const [accountDeleted, setAccountDeleted] = useState<boolean>(false);
  const [deleteSelectedProfile] = useMutation(DELETE_PROFILE);
  const [deleteUser] = useMutation(DELETE_USER);
  const router = useRouter();
  const { resetState } = useLocalState();

  useEffect(() => {
    const handleDelete = async () => {
      // Cycle through each profile id in userProfiles and trigger deleteSelectedProfile
      for (const profile of prismaUserProfiles) {
        if ('id' in profile) {
          await deleteSelectedProfile({ variables: { profileId: profile.id } });
        }
      }

      // Trigger the deleteUser mutation with variable userId as userId from LocalState
      await deleteUser({ variables: { userId } });

      // Hit the deleteUser API endpoint to delete the Auth0 user
      try {
        const response = await axios.delete('/api/deleteAuth0User');
        if (response.status === 200) {
          // Redirect the user to the login page after deleting their account
          resetState();
          router.push(PublicRoute.Home);
          setAccountDeleted(true);
        }
      } catch (error) {
        // Handle the error
        console.error('Failed to delete user', error);
      }
    };

    if (router.query.deleteAccount === 'true') {
      handleDelete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.deleteAccount]);

  return (
    <>
      {router.query.deleteAccount !== 'true' ? (
        router.push(Route.Dig)
      ) : !accountDeleted ? (
        <Pane>
          <div>Please wait. Deleting account...</div>
        </Pane>
      ) : (
        <Pane>
          <div>Account Deleted. Returning to Home Page.</div>
        </Pane>
      )}
    </>
  );
};

export default DeleteAccountPage;

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
