import Head from 'next/head';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ApolloProvider } from '@apollo/client';
import '@/styles/globals.scss';

import { client } from '../db/apollo';

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>Rare Crate</title>
      </Head>
      <UserProvider>
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </UserProvider>
    </>
  );
}
