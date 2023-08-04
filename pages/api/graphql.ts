// import { ApolloServer } from 'apollo-server-micro';
// import Cors from 'micro-cors';

// import { schema } from '../../db/graphql/schema';
// import { Context, createContext } from '../../db/graphql/context';

// let handlerPromise;

// const apolloServer = new ApolloServer({
//   schema,
//   context: ({ req, res }) => createContext(req, res),
// });

// // Create an async function to start the Apollo server
// async function startApolloServer() {
//   try {
//     // @ts-ignore
//     await apolloServer.start();
//     return apolloServer.createHandler({ path: '/api/graphql' });
//   } catch (err) {
//     console.error('Error starting Apollo Server:', err);
//   }
// }

// // Call the function immediately
// handlerPromise = startApolloServer();

// const cors = Cors();

// export default cors(async (req, res) => {
//   console.log(req.headers);
//   if (req.method === 'OPTIONS') {
//     res.end();
//     return;
//   }

//   const handler = await handlerPromise;
//   return handler(req, res);
// });

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // HELLO WORLD EXAMPLE
// import { ApolloServer, gql } from 'apollo-server-micro';
// import { startServerAndCreateNextHandler } from '@as-integrations/next';

// // Define your type definitions
// const typeDefs = gql`
//   type Query {
//     helloWorld: String
//   }
// `;

// // Define your resolvers
// const resolvers = {
//   Query: {
//     helloWorld: () => 'Hello World',
//   },
// };

// // Initialize Apollo Server
// const apolloServer = new ApolloServer({ typeDefs, resolvers });

// export default startServerAndCreateNextHandler(apolloServer);

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import Cors from 'micro-cors';

import { schema } from '@/db/graphql/schema';
import { Context, createContext } from '@/db/graphql/context';

const apolloServer = new ApolloServer<Context>({ schema });
const handler = startServerAndCreateNextHandler(apolloServer, {
  context: createContext,
});

const cors = Cors();
export default cors(handler);