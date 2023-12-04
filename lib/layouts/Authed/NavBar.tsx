import cx from 'classnames';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Archive, User as UserIcon, Plus } from '@phosphor-icons/react';
import { Route } from '@/core/enums/routes';
import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { useLocalState } from '@/lib/context/state';
import { NavBarProps } from '@/lib/layouts/Authed/Authed.types';

const NavBar = ({ disableNav }: NavBarProps) => {
  const { usernameMain } = useLocalState();
  const [profileUrl, setProfileUrl] = useState<string>(Route.Discover);

  const router = useRouter();

  useEffect(() => {
    if (usernameMain) {
      setProfileUrl(Route.Profile + `/${usernameMain}`);
    } else {
      setProfileUrl(Route.Discover);
    }
  }, [usernameMain]);

  return (
    <div className={cx('navBar')}>
      <LinkButton
        href={Route.Discover}
        disabled={disableNav}
        className={cx({ active: router.pathname.includes('discover') })}
      >
        <Archive size={24} />
      </LinkButton>
      <LinkButton
        href={Route.AddCrate}
        disabled={disableNav}
        className={cx({ active: router.pathname.includes('create') })}
      >
        <Plus size={24} />
      </LinkButton>
      <LinkButton
        href={profileUrl}
        disabled={disableNav}
        className={cx({ active: router.pathname.includes('profile') || router.pathname.includes('notifications') })}
      >
        <UserIcon size={24} />
      </LinkButton>
    </div>
  );
};

export { NavBar };
