import { ReactNode } from 'react';
import styles from './Authed.module.scss';
import NavBar from './NavBar';
import cx from 'classnames';

interface PublicLayoutProps {
  usernameMain: string;
  children: ReactNode;
}

const AuthedLayout = ({ usernameMain, children }: PublicLayoutProps) => {
  return (
    <>
      <div className={cx('wrapper')}>{children}</div>
      <NavBar className={cx('navBar')} usernameMain={usernameMain}></NavBar>
    </>
  );
};

export { AuthedLayout };
