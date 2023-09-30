import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import NavBar from './NavBar';
import cx from 'classnames';
import { Route } from '@/core/enums/routes';
import { useLocalState } from '@/lib/context/state';

interface AuthedLayoutProps {
  children: ReactNode;
}

const AuthedLayout = ({ children }: AuthedLayoutProps) => {
  const { user, error, isLoading } = useUser();
  const { profileIdMain } = useLocalState();
  const router = useRouter();

  useEffect(() => {
    if (!profileIdMain && router.pathname !== Route.NewProfile) {
      router.push(Route.NewProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <>
      <div className={cx('container')}>{children}</div>
      {profileIdMain && <NavBar className={cx('navBar')} />}
    </>
  );
};

export { AuthedLayout };
