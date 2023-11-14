import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../db/prismaClient';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, user, secret } = req.body;

  if (req.method !== 'POST') {
    return res.status(403).json({ message: 'Method not allowed' });
  }

  if (secret !== process.env.AUTH0_HOOK_SECRET) {
    return res.status(403).json({ message: `Please provide secret.` });
  }

  if (email) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update the existing user
      await prisma.user.update({
        where: { email },
        data: {
          emailVerified: user.email_verified,
        },
      });

      return res.status(200).json({
        message: `User with email: ${email} has been updated successfully!`,
      });
    } else {
      // Create a new user
      const newUser = await prisma.user.create({
        data: {
          email,
          emailVerified: user.email_verified,
          // notificationSettings: {
          //   create: {

          //   }
          // }
        },
        include: {
          notificationSettings: true,
        },
      });

      if (newUser.notificationSettings === null) {
        await prisma.notificationSettings.create({
          data: {
            user: { connect: { id: newUser.id } },
          },
        });
      }

      return await res.status(200).json({
        message: `User with email: ${email} has been created successfully!`,
      });
    }
  }
};

export default handler;
