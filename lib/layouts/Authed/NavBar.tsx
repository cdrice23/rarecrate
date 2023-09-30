import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useRouter } from 'next/router';
import { Route, PublicRoute } from '../../../core/enums/routes';
import { useLocalState } from '@/lib/context/state';
import { useEffect, useState } from 'react';

type NavBarProps = {
  className: string;
  disableNav: boolean;
};

export const NavBar = ({ className, disableNav }: NavBarProps) => {
  // if (!usernameMain) return null;
  const { usernameMain, resetState } = useLocalState();
  const [profileUrl, setProfileUrl] = useState<string>(Route.Timeline);
  const router = useRouter();

  useEffect(() => {
    if (usernameMain) {
      setProfileUrl(Route.Profile + `/${usernameMain}`);
    } else {
      setProfileUrl(Route.Timeline);
    }
  }, [usernameMain]);

  const handleLogout = () => {
    resetState();
    router.push(PublicRoute.Logout);
  };

  return (
    <div className={className}>
      <LinkButton href={Route.Timeline} disabled={disableNav}>
        <span>Timeline</span>
      </LinkButton>
      <LinkButton href={Route.Dig} disabled={disableNav}>
        <span>Crate Digging</span>
      </LinkButton>
      <LinkButton href={Route.AddCrate} disabled={disableNav}>
        <span>Add Crate</span>
      </LinkButton>
      <LinkButton href={Route.Search} disabled={disableNav}>
        <span>Search</span>
      </LinkButton>
      <LinkButton href={profileUrl} disabled={disableNav}>
        <span>Profile</span>
      </LinkButton>
      <LinkButton onClick={handleLogout}>
        <span>Logout</span>
      </LinkButton>
    </div>
  );
};

export default NavBar;
