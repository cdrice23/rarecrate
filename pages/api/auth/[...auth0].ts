import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { Route } from '../../../core/enums/routes';

interface Error {
  status?: number;
}

export default handleAuth({
  async login(req, res) {
    try {
      // Pass custom parameters to login
      await handleLogin(req, res, {
        returnTo: Route.Timeline,
      });
    } catch (error) {
      res.status(error.status || 400).json({ message: error.message });
      console.error('An error occurred during login:', error);
    }
  },
});
