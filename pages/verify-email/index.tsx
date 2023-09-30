import { useEffect } from 'react';
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthedLayout } from '@/lib/layouts/Authed';
import { createContext } from '@/db/graphql/context';
import { useQuery } from '@apollo/client';
import cx from 'classnames';
import { Pane } from '@/lib/atoms/Pane/Pane';

import authed from '../../core/helpers/authed';
import { useLocalState } from '@/lib/context/state';
import { GET_USERNAME_BY_ID } from '@/db/graphql/clientOperations';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { PublicRoute } from '@/core/enums/routes';

interface VerifyEmailProps {
  userId?: number;
  email?: string;
  profileId?: number;
  username?: string;
}

const VerifyEmailPage = ({ userId, email }: VerifyEmailProps) => {
  return (
    <AuthedLayout>
      <>
        <Pane>
          <h1>{`Verify Email`}</h1>
        </Pane>
        <Pane>
          <h3>{`Local State:`}</h3>
          <p>{`userId (auth): ${userId}`}</p>
          <p>{`email (auth): ${email}`}</p>
        </Pane>
        <Pane>
          <h3>Note: This is what unverified users see when they log in.</h3>
        </Pane>

        <Pane>
          <h1>Please verify your email.</h1>
          <LinkButton href={PublicRoute.Logout}>Logout</LinkButton>
        </Pane>
      </>
    </AuthedLayout>
  );
};

export default VerifyEmailPage;

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
