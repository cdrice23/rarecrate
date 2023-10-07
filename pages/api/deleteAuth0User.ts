import { getSession } from '@auth0/nextjs-auth0';
import axios from 'axios';

const getManagementApiToken = async () => {
  const tokenEndpoint = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
  const payload = {
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    grant_type: 'client_credentials',
    scope: 'delete:users',
  };
  const response = await axios.post(tokenEndpoint, payload);
  return response.data.access_token;
};

const handleDeleteUser = async (userId, accessToken) => {
  const deleteUserEndpoint = `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`;
  await axios.delete(deleteUserEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const authMiddleware = async (req, res, next) => {
  const session = await getSession(req, res);
  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  next();
};

export default async function deleteUser(req, res) {
  await authMiddleware(req, res, async () => {
    const { user } = await getSession(req, res);
    try {
      const accessToken = await getManagementApiToken();
      await handleDeleteUser(user.sub, accessToken);
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
}
