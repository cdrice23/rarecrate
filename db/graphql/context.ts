import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { Claims, getSession } from '@auth0/nextjs-auth0';

import { prisma } from '../prismaClient';

export type Context = {
  prisma: PrismaClient;
  auth0User?: Claims;
  accessToken?: string;
  prismaUser?: PrismaUser;
};

export async function createContext(req: NextApiRequest, res: NextApiResponse): Promise<Context> {
  const session = await getSession(req, res);

  // if the user is not logged in, omit returning the user and accessToken
  if (!session) return { prisma };

  const { user: auth0User, accessToken } = session;

  // Fetch the Prisma user info
  const prismaUser = await prisma.user.findUnique({
    where: {
      email: auth0User?.email,
    },
  });

  return {
    prisma,
    auth0User,
    accessToken,
    prismaUser,
  };
}
