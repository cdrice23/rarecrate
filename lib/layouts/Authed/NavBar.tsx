import LinkButton from '@/lib/atoms/LinkButton/LinkButton';
import { Route, PublicRoute } from '../../../core/enums/routes';

type NavBarProps = {
  usernameMain: string;
  className: string;
};

export const NavBar = ({ usernameMain, className }: NavBarProps) => {
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
      <LinkButton href={PublicRoute.Logout}>
        <span>Logout</span>
      </LinkButton>
    </div>
  );
};

export default NavBar;
