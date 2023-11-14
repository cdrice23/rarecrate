import { prisma } from '../../db/prismaClient';
import { GetServerSideProps } from 'next';
import { getSession, Claims } from '@auth0/nextjs-auth0';
import { PublicRoute } from '../enums/routes';

export interface AuthedSSR {
  user: Claims;
}

const authed: (inner?: GetServerSideProps) => GetServerSideProps = inner => {
  return async context => {
    const session = await getSession(context.req, context.res);

    if (!session) {
      return {
        redirect: {
          permanent: false,
          destination: PublicRoute.Home,
        },
        props: {},
      };
    }

    const { user } = session;
    const userObject = await prisma.user.findUnique({
      where: {
        email: user.email as string,
      },
      select: {
        email: true,
        emailVerified: true,
      },
    });

    if (inner) {
      return inner(context);
    }

    return {
      props: {
        user: userObject,
      },
    };
  };
};

export default authed;
