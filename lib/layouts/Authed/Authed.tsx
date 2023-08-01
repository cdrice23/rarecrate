import { ReactNode } from 'react';
import styles from './Authed.module.scss';
import NavBar from './NavBar';
import cx from 'classnames';

interface PublicLayoutProps {
  children: ReactNode;
}

const AuthedLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <div className={cx('wrapper')}>{children}</div>
      <NavBar className={cx('navBar')}></NavBar>
    </>
  );
};

export { AuthedLayout };
