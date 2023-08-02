import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: '/api/graphql',
  headers: {
    'Content-Type': 'application/json',
  },
  cache: new InMemoryCache(),
});
