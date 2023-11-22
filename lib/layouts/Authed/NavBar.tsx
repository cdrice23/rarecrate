import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Route, PublicRoute } from '@/core/enums/routes';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useLocalState } from '@/lib/context/state';
import { UPDATE_LAST_LOGIN_PROFILE } from '@/db/graphql/clientOperations';
import { NavBarProps } from '@/types/layouts/Authed.types';

export const NavBar = ({ className, disableNav }: NavBarProps) => {
  const [updateLastLoginProfile] = useMutation(UPDATE_LAST_LOGIN_PROFILE);
  // if (!usernameMain) return null;
  const { userId, profileIdMain, usernameMain, resetState } = useLocalState();
  const [profileUrl, setProfileUrl] = useState<string>(Route.Dig);
  const router = useRouter();

  useEffect(() => {
    if (usernameMain) {
      setProfileUrl(Route.Profile + `/${usernameMain}`);
    } else {
      setProfileUrl(Route.Dig);
    }
  }, [usernameMain]);

  const handleLogout = async () => {
    resetState();
    await updateLastLoginProfile({ variables: { userId, profileId: profileIdMain } });
    router.push(PublicRoute.Logout);
  };

  return (
    <div className={className}>
      <LinkButton href={Route.Notifications} disabled={disableNav}>
        <span>Notifications</span>
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
