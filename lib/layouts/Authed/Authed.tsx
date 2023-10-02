import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import NavBar from './NavBar';
import cx from 'classnames';
import { Route } from '@/core/enums/routes';

interface AuthedLayoutProps {
  children: ReactNode;
  userProfiles: any[];
}

const AuthedLayout = ({ children, userProfiles }: AuthedLayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    if (userProfiles.length === 0 && router.pathname !== Route.NewProfile) {
      router.push(Route.NewProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <>
      <div className={cx('container')}>{children}</div>
      <NavBar className={cx('navBar')} disableNav={Boolean(userProfiles.length === 0)} />
    </>
  );
};

export { AuthedLayout };
