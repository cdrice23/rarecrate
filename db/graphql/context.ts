import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Claims, getSession } from '@auth0/nextjs-auth0';

import { prisma } from '../prismaClient';

export type Context = {
  prisma: PrismaClient;
  user?: Claims;
  accessToken?: string;
};

export async function createContext(req: NextApiRequest, res: NextApiResponse): Promise<Context> {
  const session = await getSession(req, res);

  // if the user is not logged in, omit returning the user and accessToken
  if (!session) return { prisma };

  const { user, accessToken } = session;

  return {
    prisma,
    user,
    accessToken,
  };
}
