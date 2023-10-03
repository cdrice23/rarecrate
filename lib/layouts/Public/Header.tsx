import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '@auth0/nextjs-auth0/client';
import cx from 'classnames';

import { Route, PublicRoute } from '../../../core/enums/routes';

interface IHeader {
  isAuth?: boolean;
  children?: ReactNode;
}

const Header = ({ isAuth, children }: IHeader) => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = pathname => router.pathname === pathname;
  const { user } = useUser();

  const homeUrl = user ? Route.Notifications : PublicRoute.Home;

  const left = (
    <div className="header-left">
      <Link href={homeUrl} passHref>
        Rare Crate
      </Link>
    </div>
  );

  const right = (
    <div className="header-right">
      {user ? (
        <>
          <Link href={Route.Notifications} passHref>
            <span className="header-link">Notifications</span>
          </Link>
          <Link href={PublicRoute.Logout} passHref>
            <span className="header-link">{`Exit`}</span>
          </Link>
        </>
      ) : (
        <Link href={PublicRoute.Login} passHref>
          <span
            className={cx('header-link', {
              active: isActive(PublicRoute.Login),
            })}
          >
            Login
          </span>
        </Link>
      )}
    </div>
  );

  return (
    <nav
      className={cx('header-wrap', {
        authed: isAuth,
      })}
    >
      {left}
      {!isAuth && right}
    </nav>
  );
};

export { Header };
