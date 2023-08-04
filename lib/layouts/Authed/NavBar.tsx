import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route, PublicRoute } from '../../../core/enums/routes';
import { useLocalState } from '@/lib/context/state';

type NavBarProps = {
  usernameMain: string;
  className: string;
};

export const NavBar = ({ usernameMain, className }: NavBarProps) => {
  const { setUserId, setEmail, setProfileIdMain, setUsernameMain } = useLocalState();
  const handleLogOut = () => {
    // Reset the local state to default values
    setUserId(null);
    setEmail('');
    setProfileIdMain(null);
    setUsernameMain('');
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
      <LinkButton href={Route.Profile + `/${usernameMain}`}>
        <span>Profile</span>
      </LinkButton>
      <LinkButton href={PublicRoute.Logout} onClick={handleLogOut}>
        <span>Logout</span>
      </LinkButton>
    </div>
  );
};

export default NavBar;
