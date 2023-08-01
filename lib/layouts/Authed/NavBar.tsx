import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, PublicRoute } from '../../../core/enums/routes';

type NavBarProps = {
  className: string;
};

export const NavBar = ({ className }: NavBarProps) => {
  const router = useRouter();

  return (
    <div className={className}>
      <Link href={Route.Timeline} passHref>
        <span>
          <p>Timeline</p>
        </span>
      </Link>
      <Link href={Route.Dig} passHref>
        <span>
          <p>Crate Digging</p>
        </span>
      </Link>
      <Link href={Route.AddCrate} passHref>
        <span>
          <p>Add Crate</p>
        </span>
      </Link>
      <Link href={Route.Search} passHref>
        <span>
          <p>Search</p>
        </span>
      </Link>
      <Link href={Route.Profile} passHref>
        <span>
          <p>Profile</p>
        </span>
      </Link>
      <Link href={PublicRoute.Logout} passHref>
        <span>
          <p>Logout</p>
        </span>
      </Link>
    </div>
  );
};

export default NavBar;
