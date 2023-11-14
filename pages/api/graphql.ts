import Cors from 'micro-cors';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';

import { schema } from '@/db/graphql/schema';
import { Context, createContext } from '@/db/graphql/context';

const apolloServer = new ApolloServer<Context>({ schema });
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: createContext,
});

const cors = Cors();
export default cors(handler);
