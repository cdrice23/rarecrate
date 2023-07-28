import { ApolloServer } from 'apollo-server-micro';
import Cors from 'micro-cors';

import { schema } from '../../db/graphql/schema';
import { Context, createContext } from '../../db/graphql/context';

const apolloServer = new ApolloServer({
  schema,
  context: createContext,
});

// @ts-ignore
await apolloServer.start();

const cors = Cors();

export default cors((req, res) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
});

export const config = {
  api: {
    bodyParser: false,
  },
};
