import { handleAuth, handleLogin, handleLogout, handleCallback } from '@auth0/nextjs-auth0';
import { Route, PublicRoute } from '@/core/enums/routes';
import { prisma } from '@/db/prismaClient';

interface Error {
  status?: number;
}

const afterCallback = async (req, res, session, state) => {
  // Fetch the Prisma user info
  const prismaUser = await prisma.user.findUnique({
    where: {
      email: session?.user.email,
    },
    include: {
      profiles: true,
      // notificationSettings: true
    },
  });

  // console.log(`Notification Settings`, prismaUser?.notificationSettings)

  if (prismaUser.profiles.length > 0) {
    res.setHeader('Location', Route.Discover);

    return session;
  } else {
    // res.redirect(Route.VerifyEmail);
    res.setHeader('Location', Route.NewProfile);
    return session;
  }
};

export default handleAuth({
  async login(req, res) {
    try {
      // Pass custom parameters to login
      await handleLogin(req, res, {
        returnTo: '/api/auth/callback',
      });
    } catch (error) {
      res.status(error.status || 400).json({ message: error.message });
      console.error('An error occurred during login:', error);
    }
  },
  async logout(req, res) {
    try {
      await handleLogout(req, res, {
        returnTo: PublicRoute.Home,
      });
    } catch (error) {
      res.status(error.status || 400).json({ message: error.message });
      console.error('An error occurred during logout:', error);
    }
  },
  async callback(req, res) {
    try {
      await handleCallback(req, res, { afterCallback });
    } catch (error) {
      res.status(error.status || 400).json({ message: error.message });
      console.error('An error occurred during callback:', error);
    }
  },
});
