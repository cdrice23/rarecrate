import Head from 'next/head';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ApolloProvider } from '@apollo/client';
import { ToastContainer, Bounce } from 'react-toastify';
import '@/styles/globals.scss';
import 'react-toastify/dist/ReactToastify.min.css';
import { LocalStateProvider } from '@/lib/context/state';
import { client } from '@/db/apollo';

export default function App({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <title>Rare Crate</title>
      </Head>
      <LocalStateProvider>
        <UserProvider>
          <ApolloProvider client={client}>
            <Component {...pageProps} />
            <ToastContainer
              className="impct-toast"
              position="bottom-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              draggable={false}
              pauseOnHover
              transition={Bounce}
            />
          </ApolloProvider>
        </UserProvider>
      </LocalStateProvider>
    </>
  );
}
