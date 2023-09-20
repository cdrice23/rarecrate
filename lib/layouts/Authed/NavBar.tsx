import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useRouter } from 'next/router';
import { Route, PublicRoute } from '../../../core/enums/routes';
import { useLocalState } from '@/lib/context/state';
import { useEffect, useState } from 'react';

type NavBarProps = {
  className: string;
};

export const NavBar = ({ className }: NavBarProps) => {
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
      <LinkButton href={Route.Timeline}>
        <span>Timeline</span>
      </LinkButton>
      <LinkButton href={Route.Dig}>
        <span>Crate Digging</span>
      </LinkButton>
      <LinkButton href={Route.AddCrate}>
        <span>Add Crate</span>
      </LinkButton>
      <LinkButton href={Route.Search}>
        <span>Search</span>
      </LinkButton>
      <LinkButton href={profileUrl}>
        <span>Profile</span>
      </LinkButton>
      <LinkButton onClick={handleLogout}>
        <span>Logout</span>
      </LinkButton>
    </div>
  );
};

export default NavBar;
