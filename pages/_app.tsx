import Head from 'next/head';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import '@/styles/globals.scss';

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>Rare Crate</title>
      </Head>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </>
  );
}
